import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import { useAnchorPopoverLayout } from "./useAnchorPopoverLayout";
import {
	SelectRoot,
	SelectControl,
	SelectChipsRow,
	SelectChip,
	SelectChipLabel,
	SelectSearch,
	SelectDropdown,
	SelectEmptyHint,
	SelectOption,
} from "./SelectField.styles";

function useSelectionState(controlledValue, defaultValue, multi) {
	const isControlled = controlledValue !== undefined;
	const [inner, setInner] = useState(
		defaultValue !== undefined ? defaultValue : multi ? [] : null,
	);
	const selection = isControlled ? controlledValue : inner;
	const set = isControlled ? () => {} : setInner;
	return { selection, setSelection: set, isControlled };
}

/**
 * @typedef {{ value: string, label: string }} SelectOption
 */

/**
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   variant?: 'select' | 'multiselect' | 'chips',
 *   expandable?: boolean,
 *   options: SelectOption[],
 *   value?: string | string[] | null,
 *   defaultValue?: string | string[] | null,
 *   onChange?: (next: string | string[] | null) => void,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   filterable?: boolean,
 *   creatable?: boolean,
 *   onCreateOption?: (input: string, option: SelectOption) => void,
 *   getNewOptionData?: (input: string) => SelectOption,
 *   formatCreateLabel?: (input: string) => string,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   dropdownMaxVisibleRows?: number,
 *   dropdownRowHeightPx?: number,
 *   dropdownMaxHeightPx?: number,
 * }} props
 *
 * expandable: только chips — true = рост по высоте (несколько рядов). По умолчанию false: высота как у поля ввода, обрезка с ellipsis. multiselect не растёт по высоте; длинная строка выбранных — ellipsis.
 * creatable: можно добавить значение из ввода (как CreatableSelect): пункт «Создать…», Enter, при `filterable={false}` ввод всё равно доступен для создания.
 */
export function SelectField({
	id: idProp,
	label,
	labelMode = "above",
	variant = "select",
	expandable: expandableProp,
	options,
	value,
	defaultValue,
	onChange,
	placeholder = "Начните вводить…",
	disabled,
	required,
	filterable = true,
	creatable = false,
	onCreateOption,
	getNewOptionData,
	formatCreateLabel = (input) => `Создать «${input}»`,
	error,
	helperText,
	fullWidth = false,
	dropdownMaxVisibleRows = 5,
	dropdownRowHeightPx = 40,
	dropdownMaxHeightPx,
}) {
	const multi = variant === "multiselect" || variant === "chips";
	const chipsUi = variant === "chips";
	const expandable = Boolean(expandableProp);
	const effectiveFilterable = filterable || creatable;

	const { selection: sel, setSelection: setInner, isControlled } = useSelectionState(
		value,
		defaultValue,
		multi,
	);

	const [open, setOpen] = useState(false);
	const [focused, setFocused] = useState(false);
	const [query, setQuery] = useState("");
	const rootRef = useRef(null);
	const popoverRef = useRef(null);
	const autoId = useId();
	const id = idProp || autoId;
	const listId = `${id}-listbox`;
	const helperId = `${id}-helper`;

	const selectedSingle = multi ? null : sel;
	const selectedMulti = multi ? /** @type {string[]} */ (sel || []) : [];

	const labelBy = useMemo(() => {
		const m = new Map(options.map((o) => [o.value, o.label]));
		return (v) => m.get(v) ?? v;
	}, [options]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!effectiveFilterable) return options;
		if (!q) return options;
		return options.filter((o) => o.label.toLowerCase().includes(q));
	}, [options, query, effectiveFilterable]);

	const createCandidate = useMemo(() => {
		if (!creatable || !effectiveFilterable) return null;
		const qt = query.trim();
		if (!qt) return null;
		const data = getNewOptionData ? getNewOptionData(qt) : { value: qt, label: qt };
		const dup = options.some(
			(o) =>
				o.value === data.value ||
				o.label.trim().toLowerCase() === data.label.trim().toLowerCase(),
		);
		if (dup) return null;
		if (multi && selectedMulti.includes(data.value)) return null;
		return data;
	}, [creatable, effectiveFilterable, query, options, multi, selectedMulti, getNewOptionData]);

	const canCreate = Boolean(createCandidate);

	const optionEstimatePx = useMemo(() => {
		const n = filtered.length + (canCreate ? 1 : 0);
		return Math.max(80, n * dropdownRowHeightPx + 24);
	}, [filtered.length, canCreate, dropdownRowHeightPx]);

	const { popoverStyle } = useAnchorPopoverLayout(open && !disabled, rootRef, popoverRef, {
		gapPx: 6,
		maxVisibleRows: dropdownMaxVisibleRows,
		rowHeightPx: dropdownRowHeightPx,
		maxHeightPx: dropdownMaxHeightPx,
		contentEstimatePx: optionEstimatePx,
	});

	const filled = multi ? selectedMulti.length > 0 : Boolean(selectedSingle);

	const commit = (next) => {
		if (!isControlled) setInner(next);
		onChange?.(next);
	};

	const toggleMulti = (val) => {
		const set = new Set(selectedMulti);
		if (set.has(val)) set.delete(val);
		else set.add(val);
		commit(Array.from(set));
	};

	const pickSingle = (val) => {
		commit(val);
		setOpen(false);
		setQuery("");
	};

	const handleCreate = () => {
		if (!createCandidate) return;
		const rawInput = query.trim();
		onCreateOption?.(rawInput, createCandidate);
		if (multi) {
			commit([...selectedMulti, createCandidate.value]);
		} else {
			commit(createCandidate.value);
		}
		setOpen(false);
		setQuery("");
	};

	useEffect(() => {
		if (!open) return;
		const onDoc = (e) => {
			if (!rootRef.current?.contains(e.target)) {
				setOpen(false);
				setQuery("");
			}
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [open]);

	const floating = labelMode === "floating";

	const showError = Boolean(error);
	const helper =
		(typeof error === "string" ? error : error ? "Ошибка" : "") ||
		helperText ||
		"";
	const describedBy = helper ? helperId : undefined;

	const inputDisplay = () => {
		if (effectiveFilterable && open) return query;
		if (multi && chipsUi) return "";
		if (multi && !chipsUi) {
			return selectedMulti.length ? selectedMulti.map(labelBy).join(", ") : "";
		}
		if (!multi && selectedSingle) return labelBy(selectedSingle);
		return "";
	};

	const inputReadOnly =
		!effectiveFilterable ||
		(!open &&
			((!multi && Boolean(selectedSingle)) ||
				(multi && !chipsUi && selectedMulti.length > 0)));

	const showChipsRow = chipsUi && selectedMulti.length > 0;
	const stackChipsResolved = chipsUi && expandable && selectedMulti.length > 0;
	const inlineChips = showChipsRow && !stackChipsResolved;
	const searchOnlyFullWidth = variant === "select" || !showChipsRow || stackChipsResolved;
	const allowVerticalGrow = stackChipsResolved;

	const inner = (
		<SelectRoot ref={rootRef}>
			<SelectControl
				$floating={floating}
				$focused={focused || open}
				$error={Boolean(error)}
				$stackChips={stackChipsResolved}
				$inlineChips={inlineChips}
				$allowGrow={allowVerticalGrow}
				onMouseDown={(e) => {
					if (disabled) return;
					if (e.target.closest("button")) return;
					setOpen(true);
				}}
			>
				{showChipsRow && (
					<SelectChipsRow $expandable={expandable}>
						{selectedMulti.map((v) => (
							<SelectChip
								type="button"
								key={v}
								$expandable={expandable}
								onClick={(e) => {
									e.stopPropagation();
									toggleMulti(v);
								}}
							>
								<SelectChipLabel>{labelBy(v)}</SelectChipLabel>
								<span aria-hidden>×</span>
							</SelectChip>
						))}
					</SelectChipsRow>
				)}
				<SelectSearch
					id={id}
					disabled={disabled}
					required={required}
					readOnly={inputReadOnly}
					placeholder={
						floating
							? undefined
							: multi && !chipsUi && selectedMulti.length
								? `${selectedMulti.length} выбрано`
								: !multi && selectedSingle
									? labelBy(selectedSingle)
									: placeholder
					}
					value={inputDisplay()}
					onChange={(e) => {
						if (!effectiveFilterable) return;
						setQuery(e.target.value);
						setOpen(true);
					}}
					onFocus={() => {
						setFocused(true);
						setOpen(true);
						if (effectiveFilterable) setQuery("");
					}}
					onBlur={() => {
						setFocused(false);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter" && canCreate) {
							e.preventDefault();
							handleCreate();
						}
					}}
					aria-expanded={open}
					aria-controls={listId}
					aria-invalid={showError || undefined}
					aria-describedby={describedBy}
					role="combobox"
					autoComplete="off"
					$floating={floating}
					$stackChips={stackChipsResolved}
					$onlyInput={searchOnlyFullWidth}
				/>
			</SelectControl>
			{open && !disabled && (
				<SelectDropdown id={listId} role="listbox" ref={popoverRef} style={popoverStyle}>
					{filtered.length === 0 && !canCreate && <SelectEmptyHint>Нет совпадений</SelectEmptyHint>}
					{filtered.map((o) => {
						const active = multi ? selectedMulti.includes(o.value) : selectedSingle === o.value;
						return (
							<SelectOption
								key={o.value}
								role="option"
								aria-selected={active}
								$active={active}
								onMouseDown={(e) => {
									e.preventDefault();
									if (multi) toggleMulti(o.value);
									else pickSingle(o.value);
								}}
							>
								{o.label}
								{multi && active ? " ✓" : ""}
							</SelectOption>
						);
					})}
					{canCreate && (
						<SelectOption
							key="__creatable__"
							role="option"
							aria-selected={false}
							$active={false}
							onMouseDown={(e) => {
								e.preventDefault();
								handleCreate();
							}}
						>
							{formatCreateLabel(query.trim())}
						</SelectOption>
					)}
				</SelectDropdown>
			)}
		</SelectRoot>
	);

	return (
		<FieldShell
			id={id}
			label={label}
			labelMode={labelMode}
			error={error}
			helperText={helperText}
			disabled={disabled}
			fullWidth={fullWidth}
			filled={filled}
			focused={focused || open}
			attachAriaToChild={false}
		>
			{inner}
		</FieldShell>
	);
}
