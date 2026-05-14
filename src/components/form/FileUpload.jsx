import React, { useCallback, useId, useMemo, useRef, useState } from "react";
import {
	Root,
	Label,
	Helper,
	HiddenInput,
	DropZone,
	DropHint,
	DropSub,
	SelectButton,
	Toolbar,
	List,
	Row,
	ThumbWrap,
	ThumbImg,
	Meta,
	Name,
	SizeLine,
	ProgressTrack,
	ProgressFill,
	RemoveBtn,
} from "./FileUpload.styles";

function formatBytes(n) {
	if (n < 1024) return `${n} Б`;
	if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} КБ`;
	return `${(n / (1024 * 1024)).toFixed(1)} МБ`;
}

/**
 * @param {File} file
 * @param {string | undefined} accept
 */
function fileMatchesAccept(file, accept) {
	if (!accept || !accept.trim()) return true;
	const parts = accept.split(",").map((s) => s.trim()).filter(Boolean);
	const name = file.name.toLowerCase();
	const type = file.type.toLowerCase();
	for (const part of parts) {
		if (part.startsWith(".")) {
			if (name.endsWith(part.toLowerCase())) return true;
			continue;
		}
		if (part.includes("*")) {
			const esc = part.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace("\\*", ".*");
			const re = new RegExp(`^${esc}$`, "i");
			if (re.test(type)) return true;
			continue;
		}
		if (type === part.toLowerCase()) return true;
	}
	return false;
}

function isImageFile(file) {
	return file.type.startsWith("image/");
}

/**
 * @typedef {{
 *   id: string,
 *   file: File,
 *   previewUrl: string | null,
 *   progress: number,
 *   status: 'local' | 'uploading' | 'done' | 'error',
 *   error: string | null,
 * }} FileUploadItem
 */

function makeId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * @param {FileUploadItem[]} prev
 * @param {File[]} incoming
 * @param {{
 *   maxCount: number,
 *   maxFiles: number | undefined,
 *   accept: string | undefined,
 *   maxSize: number | undefined,
 *   revokePreview: (it: { previewUrl: string | null }) => void,
 * }} opts
 */
function mergeIncoming(prev, incoming, opts) {
	const { maxCount, maxFiles, accept, maxSize, revokePreview } = opts;
	const rejections = [];
	if (maxCount === 1) prev.forEach(revokePreview);
	let base = maxCount === 1 ? [] : [...prev];
	/** @type {FileUploadItem[]} */
	const added = [];

	for (const file of incoming) {
		if (base.length >= maxCount) {
			rejections.push(`${file.name}: лимит файлов (${maxFiles ?? maxCount})`);
			continue;
		}
		if (!fileMatchesAccept(file, accept)) {
			rejections.push(`${file.name}: не подходит под accept`);
			continue;
		}
		if (maxSize !== undefined && file.size > maxSize) {
			rejections.push(`${file.name}: больше maxSize (${formatBytes(maxSize)})`);
			continue;
		}
		const id = makeId();
		const previewUrl = isImageFile(file) ? URL.createObjectURL(file) : null;
		const entry = {
			id,
			file,
			previewUrl,
			progress: 0,
			status: /** @type {'local'} */ ("local"),
			error: null,
		};
		base = [...base, entry];
		added.push(entry);
	}

	return { next: base, added, rejections };
}

/**
 * Загрузка файлов: drag-and-drop и/или кнопка, ограничения accept / maxSize / maxFiles,
 * превью изображений, прогресс при переданном `onUpload`, удаление до отправки.
 * Без `onUpload` — только локальный список файлов, `onChange` отдаёт актуальный `File[]`.
 *
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above',
 *   variant?: 'combined' | 'dropzone' | 'button',
 *   accept?: string,
 *   maxSize?: number,
 *   maxFiles?: number,
 *   multiple?: boolean,
 *   disabled?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   preserveHelperSpace?: boolean,
 *   onChange?: (files: File[]) => void,
 *   onUpload?: (
 *     file: File,
 *     ctx: { signal: AbortSignal; onProgress: (fraction: number) => void },
 *   ) => Promise<unknown>,
 *   onUploadComplete?: (file: File, result: unknown) => void,
 *   onUploadError?: (file: File, err: unknown) => void,
 * }} props
 */
export function FileUpload({
	id: idProp,
	label,
	labelMode = "above",
	variant = "combined",
	accept,
	maxSize,
	maxFiles,
	multiple = true,
	disabled,
	error,
	helperText,
	fullWidth = false,
	preserveHelperSpace = true,
	onChange,
	onUpload,
	onUploadComplete,
	onUploadError,
}) {
	const autoId = useId();
	const fieldId = idProp || autoId;
	const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
	const dragDepth = useRef(0);
	const [dragActive, setDragActive] = useState(false);
	const abortById = useRef(new Map());
	const uploadBatchRef = useRef(/** @type {FileUploadItem[]} */ ([]));

	const [items, setItems] = useState(/** @type {FileUploadItem[]} */ ([]));

	const showLabel = labelMode !== "none" && Boolean(label?.length);
	const errorText = typeof error === "string" ? error : error ? "Ошибка" : "";
	const showError = Boolean(error);
	const helper = showError ? errorText : helperText || "";

	const effectiveMultiple = useMemo(() => {
		if (maxFiles === 1) return false;
		return multiple;
	}, [maxFiles, multiple]);

	const maxCount = maxFiles === undefined ? Number.POSITIVE_INFINITY : maxFiles;

	const notifyChange = useCallback(
		(next) => {
			onChange?.(next.map((it) => it.file));
		},
		[onChange],
	);

	const revokePreview = useCallback((it) => {
		if (it.previewUrl) URL.revokeObjectURL(it.previewUrl);
	}, []);

	const removeAt = useCallback(
		(id) => {
			const ac = abortById.current.get(id);
			if (ac) {
				ac.abort();
				abortById.current.delete(id);
			}
			setItems((prev) => {
				const victim = prev.find((x) => x.id === id);
				if (victim) revokePreview(victim);
				const next = prev.filter((x) => x.id !== id);
				notifyChange(next);
				return next;
			});
		},
		[notifyChange, revokePreview],
	);

	const runUpload = useCallback(
		async (item) => {
			if (!onUpload) return;
			const ac = new AbortController();
			abortById.current.set(item.id, ac);
			setItems((prev) =>
				prev.map((x) =>
					x.id === item.id
						? { ...x, status: "uploading", progress: 0, error: null }
						: x,
				),
			);
			try {
				const result = await onUpload(item.file, {
					signal: ac.signal,
					onProgress: (fraction) => {
						const p = Math.min(1, Math.max(0, fraction));
						setItems((prev) =>
							prev.map((x) => (x.id === item.id ? { ...x, progress: p } : x)),
						);
					},
				});
				abortById.current.delete(item.id);
				setItems((prev) =>
					prev.map((x) =>
						x.id === item.id ? { ...x, status: "done", progress: 1, error: null } : x,
					),
				);
				onUploadComplete?.(item.file, result);
			} catch (err) {
				if (ac.signal.aborted) return;
				abortById.current.delete(item.id);
				const msg = err instanceof Error ? err.message : "Ошибка загрузки";
				setItems((prev) =>
					prev.map((x) =>
						x.id === item.id ? { ...x, status: "error", error: msg, progress: 0 } : x,
					),
				);
				onUploadError?.(item.file, err);
			}
		},
		[onUpload, onUploadComplete, onUploadError],
	);

	const ingestFiles = useCallback(
		(fileList) => {
			const incoming = Array.from(fileList || []);
			if (!incoming.length || disabled) return;

			setItems((prev) => {
				const { next, added, rejections } = mergeIncoming(prev, incoming, {
					maxCount,
					maxFiles,
					accept,
					maxSize,
					revokePreview,
				});
				if (rejections.length && typeof console !== "undefined" && console.warn) {
					console.warn("[FileUpload]", rejections.join("; "));
				}
				notifyChange(next);
				uploadBatchRef.current = added;
				return next;
			});

			queueMicrotask(() => {
				const batch = uploadBatchRef.current;
				uploadBatchRef.current = [];
				if (onUpload && batch.length) {
					batch.forEach((entry) => runUpload(entry));
				}
			});
		},
		[accept, disabled, maxCount, maxFiles, maxSize, notifyChange, onUpload, revokePreview, runUpload],
	);

	const openPicker = () => inputRef.current?.click();

	const onInputChange = (e) => {
		const { files } = e.target;
		if (files?.length) ingestFiles(files);
		e.target.value = "";
	};

	const onDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragDepth.current += 1;
		setDragActive(true);
	};

	const onDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragDepth.current = Math.max(0, dragDepth.current - 1);
		if (dragDepth.current === 0) setDragActive(false);
	};

	const onDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const onDrop = (e) => {
		e.preventDefault();
		e.stopPropagation();
		dragDepth.current = 0;
		setDragActive(false);
		if (disabled) return;
		ingestFiles(e.dataTransfer?.files);
	};

	const dropZoneProps = {
		role: "button",
		tabIndex: disabled ? -1 : 0,
		"aria-disabled": disabled ? "true" : undefined,
		"aria-describedby": helper ? `${fieldId}-helper` : undefined,
		$error: showError,
		$active: dragActive,
		$disabled: disabled,
		onDragEnter,
		onDragLeave,
		onDragOver,
		onDrop,
		onKeyDown: (e) => {
			if (disabled) return;
			if (e.key === "Enter" || e.key === " ") {
				e.preventDefault();
				openPicker();
			}
		},
		onClick: () => {
			if (!disabled && (variant === "dropzone" || variant === "combined")) openPicker();
		},
	};

	const constraintsLine = [
		accept ? `accept: ${accept}` : null,
		maxSize ? `до ${formatBytes(maxSize)}` : null,
		Number.isFinite(maxCount) ? `макс. файлов: ${maxFiles}` : null,
	]
		.filter(Boolean)
		.join(" · ");

	const rootDropHandlers =
		variant === "button" && !disabled
			? {
					onDragEnter,
					onDragLeave,
					onDragOver,
					onDrop,
				}
			: {};

	return (
		<Root
			$fullWidth={fullWidth}
			$dropOutline={variant === "button" && dragActive}
			$disabled={disabled}
			{...rootDropHandlers}
		>
			{showLabel ? (
				<Label htmlFor={fieldId} $error={showError}>
					{label}
				</Label>
			) : null}

			<HiddenInput
				ref={inputRef}
				id={fieldId}
				type="file"
				accept={accept}
				multiple={effectiveMultiple}
				disabled={disabled}
				onChange={onInputChange}
			/>

			{variant === "button" ? (
				<Toolbar>
					<SelectButton type="button" disabled={disabled} onClick={openPicker}>
						Выбрать файл
					</SelectButton>
				</Toolbar>
			) : null}

			{variant === "dropzone" || variant === "combined" ? (
				<DropZone {...dropZoneProps}>
					{variant === "combined" ? (
						<>
							<DropHint $withButton>
								Перетащите файлы сюда или нажмите, чтобы выбрать
							</DropHint>
							<SelectButton
								type="button"
								disabled={disabled}
								onClick={(e) => {
									e.stopPropagation();
									openPicker();
								}}
							>
								Выбрать файл
							</SelectButton>
						</>
					) : (
						<DropHint $withButton={false}>
							Перетащите файлы сюда или нажмите для выбора
						</DropHint>
					)}
					{constraintsLine ? <DropSub>{constraintsLine}</DropSub> : null}
				</DropZone>
			) : null}

			{variant === "button" && constraintsLine ? <DropSub>{constraintsLine}</DropSub> : null}

			{items.length > 0 ? (
				<List>
					{items.map((it) => (
						<Row key={it.id}>
							<ThumbWrap>
								{it.previewUrl ? (
									<ThumbImg src={it.previewUrl} alt="" />
								) : (
									<span>{it.file.name.split(".").pop()?.slice(0, 4) || "—"}</span>
								)}
							</ThumbWrap>
							<Meta>
								<Name title={it.file.name}>{it.file.name}</Name>
								<SizeLine>
									{formatBytes(it.file.size)}
									{it.status === "uploading" ? ` · загрузка ${Math.round(it.progress * 100)}%` : ""}
									{it.status === "done" ? " · готово" : ""}
									{it.status === "error" && it.error ? ` · ${it.error}` : ""}
								</SizeLine>
								{it.status === "uploading" ? (
									<ProgressTrack aria-label="Прогресс загрузки">
										<ProgressFill $p={it.progress} />
									</ProgressTrack>
								) : null}
							</Meta>
							<RemoveBtn
								type="button"
								aria-label="Удалить файл"
								disabled={disabled}
								onClick={() => removeAt(it.id)}
							>
								×
							</RemoveBtn>
						</Row>
					))}
				</List>
			) : null}

			<Helper id={`${fieldId}-helper`} $error={showError} $preserveHelper={preserveHelperSpace}>
				{helper}
			</Helper>
		</Root>
	);
}
