import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import {
	TagInputRoot,
	TagShell,
	TagChip,
	TagChipLabel,
	TagChipRemove,
	TagNativeInput,
	TagHidden,
	TagSuggestPop,
	TagSuggestItem,
	TagInlineHint,
} from "./TagInput.styles";

function useTagsState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(() => (Array.isArray(defaultValue) ? defaultValue : []));
	const tags = isControlled ? (Array.isArray(value) ? value : []) : inner;
	const setTags = isControlled ? () => {} : setInner;
	const filled = useMemo(() => tags.length > 0, [tags]);
	return { tags, setTags, filled, isControlled };
}

function normalizeTag(raw) {
	return String(raw ?? "").trim().replace(/\s+/g, " ");
}

function hasDuplicate(tag, tags, caseInsensitive) {
	const t = caseInsensitive ? tag.toLowerCase() : tag;
	return tags.some((x) => (caseInsensitive ? x.toLowerCase() : x) === t);
}

function testPattern(tag, pattern) {
	if (pattern == null || pattern === "") return true;
	const re = pattern instanceof RegExp ? pattern : new RegExp(pattern);
	return re.test(tag);
}

function tokenizePaste(text, seps) {
	let parts = [text];
	if (seps.comma) parts = parts.flatMap((p) => p.split(","));
	if (seps.space) parts = parts.flatMap((p) => p.split(/\s+/));
	return parts.map((p) => normalizeTag(p)).filter(Boolean);
}

const DEFAULT_SEP = { enter: true, comma: true, space: false };

/**
 * Ввод тегов чипсами (как в редакторах). Разделители: Enter, запятая, пробел — через `commitSeparators`.
 * С атрибутом `name` скрытое поле отправляет `JSON.stringify(tags)`, чтобы запятые внутри тега не ломали форму.
 *
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   value?: string[],
 *   defaultValue?: string[],
 *   onChange?: (e: { target: { value: string[] }, currentTarget: { value: string[] } }) => void,
 *   name?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   maxTags?: number,
 *   duplicatePolicy?: 'reject' | 'allow',
 *   caseInsensitiveDuplicates?: boolean,
 *   pattern?: RegExp | string,
 *   validateTag?: (tag: string, allTags: string[]) => string | null,
 *   suggestions?: string[],
 *   commitSeparators?: { enter?: boolean, comma?: boolean, space?: boolean },
 *   expandable?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 * }} props
 */
export function TagInput({
	id: idProp,
	label,
	labelMode = "above",
	value,
	defaultValue,
	onChange,
	name,
	placeholder = "Добавьте тег…",
	disabled,
	required,
	maxTags,
	duplicatePolicy = "reject",
	caseInsensitiveDuplicates = true,
	pattern,
	validateTag,
	suggestions = [],
	commitSeparators: commitSeparatorsProp,
	expandable = true,
	error,
	helperText,
	fullWidth = false,
}) {
	const autoId = useId();
	const fieldId = idProp || autoId;
	const helperId = `${fieldId}-helper`;
	const listboxId = `${fieldId}-suggestions`;

	const commitSeparators = { ...DEFAULT_SEP, ...commitSeparatorsProp };
	const { tags, setTags, filled, isControlled } = useTagsState(value, defaultValue);

	const [draft, setDraft] = useState("");
	const [focused, setFocused] = useState(false);
	const [suggestOpen, setSuggestOpen] = useState(false);
	const [activeSuggest, setActiveSuggest] = useState(-1);
	const [rejectHint, setRejectHint] = useState("");
	const rootRef = useRef(null);
	const inputRef = useRef(null);

	const floating = labelMode === "floating";
	const showError = Boolean(error);
	const helper =
		(typeof error === "string" ? error : error ? "Ошибка" : "") ||
		helperText ||
		"";
	const describedBy = helper ? helperId : undefined;

	const emit = useCallback(
		(next) => {
			if (!isControlled) setTags(next);
			const target = { value: next, name, id: fieldId };
			onChange?.({ target, currentTarget: target });
		},
		[isControlled, setTags, onChange, name, fieldId],
	);

	const tryAddOne = useCallback(
		(raw) => {
			const tag = normalizeTag(raw);
			if (!tag) return true;
			setRejectHint("");
			if (maxTags != null && tags.length >= maxTags) {
				setRejectHint(`Не больше ${maxTags} тегов`);
				return false;
			}
			if (duplicatePolicy === "reject" && hasDuplicate(tag, tags, caseInsensitiveDuplicates)) {
				setRejectHint("Тег уже есть");
				return false;
			}
			if (!testPattern(tag, pattern)) {
				setRejectHint("Формат тега не подходит");
				return false;
			}
			if (validateTag) {
				const msg = validateTag(tag, tags);
				if (msg) {
					setRejectHint(msg);
					return false;
				}
			}
			emit([...tags, tag]);
			return true;
		},
		[tags, maxTags, duplicatePolicy, caseInsensitiveDuplicates, pattern, validateTag, emit],
	);

	const removeAt = (idx) => {
		const next = tags.filter((_, i) => i !== idx);
		emit(next);
		setRejectHint("");
	};

	const commitDraft = useCallback(() => {
		const t = normalizeTag(draft);
		if (!t) {
			setDraft("");
			return;
		}
		if (tryAddOne(t)) setDraft("");
	}, [draft, tryAddOne]);

	const filteredSuggestions = useMemo(() => {
		if (!suggestions.length) return [];
		const taken = new Set(
			tags.map((x) => (caseInsensitiveDuplicates ? x.toLowerCase() : x)),
		);
		const base = suggestions.filter((s) => {
			const key = caseInsensitiveDuplicates ? s.toLowerCase() : s;
			return !taken.has(key);
		});
		const q = draft.trim();
		if (!q) return base.slice(0, 10);
		return base.filter((s) => s.toLowerCase().startsWith(q.toLowerCase())).slice(0, 10);
	}, [suggestions, tags, draft, caseInsensitiveDuplicates]);

	useEffect(() => {
		if (!suggestOpen) return;
		const onDoc = (e) => {
			if (!rootRef.current?.contains(e.target)) setSuggestOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [suggestOpen]);

	useEffect(() => {
		setActiveSuggest((i) => {
			if (!filteredSuggestions.length) return -1;
			if (i < 0) return -1;
			return Math.min(i, filteredSuggestions.length - 1);
		});
	}, [filteredSuggestions]);

	const atMax = maxTags != null && tags.length >= maxTags;

	const handleKeyDown = (e) => {
		if (e.key === "Backspace" && !draft && tags.length > 0) {
			e.preventDefault();
			removeAt(tags.length - 1);
			return;
		}
		if (suggestOpen && filteredSuggestions.length > 0) {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveSuggest((i) => {
					const len = filteredSuggestions.length;
					if (len === 0) return -1;
					if (i < 0) return 0;
					return Math.min(i + 1, len - 1);
				});
				return;
			}
			if (e.key === "ArrowUp") {
				e.preventDefault();
				setActiveSuggest((i) => (i <= 0 ? -1 : i - 1));
				return;
			}
			if (e.key === "Enter" && activeSuggest >= 0) {
				e.preventDefault();
				const pick = filteredSuggestions[activeSuggest];
				if (pick && tryAddOne(pick)) {
					setDraft("");
					setSuggestOpen(false);
					setActiveSuggest(-1);
				}
				return;
			}
		}
		if (e.key === "Enter" && commitSeparators.enter !== false) {
			e.preventDefault();
			commitDraft();
			setSuggestOpen(false);
			setActiveSuggest(-1);
			return;
		}
		if (e.key === "," && commitSeparators.comma) {
			e.preventDefault();
			commitDraft();
			return;
		}
		if (e.key === " " && commitSeparators.space) {
			e.preventDefault();
			commitDraft();
			return;
		}
		if (e.key === "Escape") {
			setSuggestOpen(false);
			setActiveSuggest(-1);
		}
	};

	const handlePaste = (e) => {
		const text = e.clipboardData.getData("text");
		if (!text.includes(",") && !/\s/.test(text)) return;
		const tokens = tokenizePaste(text, commitSeparators);
		if (tokens.length <= 1) return;
		e.preventDefault();
		let cur = [...tags];
		for (const tok of tokens) {
			if (maxTags != null && cur.length >= maxTags) break;
			const tag = normalizeTag(tok);
			if (!tag) continue;
			if (duplicatePolicy === "reject" && hasDuplicate(tag, cur, caseInsensitiveDuplicates)) continue;
			if (!testPattern(tag, pattern)) continue;
			if (validateTag) {
				const msg = validateTag(tag, cur);
				if (msg) continue;
			}
			cur = [...cur, tag];
		}
		if (cur.length === tags.length) return;
		emit(cur);
		setDraft("");
		setRejectHint("");
	};

	const handleBlur = () => {
		setFocused(false);
		setSuggestOpen(false);
		setActiveSuggest(-1);
		if (normalizeTag(draft)) commitDraft();
	};

	const addSuggestion = (s) => {
		if (tryAddOne(s)) {
			setDraft("");
			setSuggestOpen(false);
			inputRef.current?.focus();
		}
	};

	const inner = (
		<TagInputRoot ref={rootRef}>
			{name ? (
				<TagHidden
					type="hidden"
					name={name}
					value={JSON.stringify(tags)}
					readOnly
					tabIndex={-1}
					aria-hidden
					required={Boolean(required)}
				/>
			) : null}
			<TagShell
				$floating={floating}
				$focused={focused}
				$error={showError}
				$expandable={expandable}
				onClick={() => inputRef.current?.focus()}
			>
				{tags.map((t, idx) => (
					<TagChip key={`${t}-${idx}`}>
						<TagChipLabel>{t}</TagChipLabel>
						<TagChipRemove
							type="button"
							disabled={disabled}
							aria-label={`Удалить тег ${t}`}
							onClick={(e) => {
								e.stopPropagation();
								removeAt(idx);
							}}
						>
							×
						</TagChipRemove>
					</TagChip>
				))}
				<TagNativeInput
					ref={inputRef}
					id={fieldId}
					type="text"
					autoComplete="off"
					placeholder={tags.length === 0 ? placeholder : undefined}
					disabled={disabled || atMax}
					required={Boolean(required && tags.length === 0 && !name)}
					aria-invalid={showError || undefined}
					aria-describedby={describedBy}
					aria-expanded={suggestOpen && filteredSuggestions.length > 0}
					aria-controls={suggestOpen && filteredSuggestions.length > 0 ? listboxId : undefined}
					aria-autocomplete="list"
					value={draft}
					onChange={(e) => {
						setDraft(e.target.value);
						setRejectHint("");
						setActiveSuggest(-1);
						if (suggestions.length) setSuggestOpen(true);
					}}
					onKeyDown={handleKeyDown}
					onPaste={handlePaste}
					onFocus={() => {
						setFocused(true);
						if (suggestions.length) setSuggestOpen(true);
					}}
					onBlur={handleBlur}
				/>
			</TagShell>
			{rejectHint ? <TagInlineHint role="status">{rejectHint}</TagInlineHint> : null}
			{suggestOpen && filteredSuggestions.length > 0 && !disabled ? (
				<TagSuggestPop id={listboxId} role="listbox" aria-label="Подсказки тегов">
					{filteredSuggestions.map((s, i) => (
						<TagSuggestItem
							key={s}
							role="option"
							data-active={i === activeSuggest}
							onMouseDown={(e) => {
								e.preventDefault();
								addSuggestion(s);
							}}
						>
							{s}
						</TagSuggestItem>
					))}
				</TagSuggestPop>
			) : null}
		</TagInputRoot>
	);

	return (
		<FieldShell
			id={fieldId}
			label={label}
			labelMode={labelMode}
			error={error}
			helperText={helperText}
			disabled={disabled}
			fullWidth={fullWidth}
			filled={filled}
			focused={focused || suggestOpen}
			attachAriaToChild={false}
		>
			{inner}
		</FieldShell>
	);
}
