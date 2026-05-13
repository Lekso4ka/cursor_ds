import React, { useEffect, useId, useMemo, useState } from "react";
import { FieldShell } from "./FieldShell";
import { BaseInput } from "./BaseInput";
import { NumberRow, NumberFlexInput, NumberSuffixEl, NumberHidden } from "./NumberField.styles";

const DEFAULT_THOUSANDS_SEP = "\u202f";

function usePlainFilledState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(
		defaultValue === undefined || defaultValue === "" ? "" : String(defaultValue),
	);
	const v = isControlled ? value : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => String(v ?? "").length > 0, [v]);
	return { value: v, setValue: setV, filled, isControlled };
}

function stripGrouping(s, sep) {
	let t = String(s);
	if (sep) {
		for (let i = 0; i < sep.length; i += 1) {
			t = t.split(sep[i]).join("");
		}
	}
	return t.replace(/\s/g, "").trim();
}

function normalizeDecimalInput(s) {
	return String(s).replace(/,/g, ".");
}

function canonicalFromRaw(raw, thousandsSeparator) {
	return normalizeDecimalInput(stripGrouping(raw, thousandsSeparator));
}

function addThousandsToIntPart(intPart, sep) {
	if (!intPart || intPart === "-") return intPart;
	const neg = intPart.startsWith("-");
	const d = neg ? intPart.slice(1) : intPart;
	if (!d) return intPart;
	const grouped = d.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
	return (neg ? "-" : "") + grouped;
}

function formatCanonicalWithThousands(canonical, thousandsSeparator) {
	if (!canonical) return "";
	const parts = canonical.split(".");
	const intp = addThousandsToIntPart(parts[0], thousandsSeparator);
	if (parts.length > 1) return `${intp}.${parts.slice(1).join("")}`;
	return intp;
}

function cleanTyping(raw, thousandsSeparator) {
	const s = normalizeDecimalInput(stripGrouping(raw, thousandsSeparator));
	let out = "";
	let hasDot = false;
	let i = 0;
	if (s[0] === "-") {
		out = "-";
		i = 1;
	}
	for (; i < s.length; i += 1) {
		const ch = s[i];
		if (ch >= "0" && ch <= "9") {
			out += ch;
			continue;
		}
		if ((ch === "." || ch === ",") && !hasDot) {
			out += ".";
			hasDot = true;
		}
	}
	return out;
}

function clampCanonical(canonical, min, max) {
	if (canonical === "" || canonical === "-" || canonical === "." || canonical === "-.") return canonical;
	const n = Number(canonical);
	if (Number.isNaN(n)) return canonical;
	let v = n;
	if (max !== undefined && !Number.isNaN(Number(max)) && v > Number(max)) v = Number(max);
	if (min !== undefined && !Number.isNaN(Number(min)) && v < Number(min)) v = Number(min);
	if (n === v) return canonical;
	return String(v);
}

function propToCanonical(val) {
	if (val === undefined || val === null || val === "") return "";
	return normalizeDecimalInput(String(val).replace(/\s/g, ""));
}

function initialDisplayText(val, def, groupThousands, thousandsSeparator) {
	const c = propToCanonical(val !== undefined ? val : def ?? "");
	return groupThousands && c ? formatCanonicalWithThousands(c, thousandsSeparator) : c;
}

/**
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   value?: string | number,
 *   defaultValue?: string | number,
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   name?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   min?: number,
 *   max?: number,
 *   step?: number | 'any',
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   groupThousands?: boolean,
 *   thousandsSeparator?: string,
 *   suffix?: string,
 * }} props
 *
 * При `groupThousands` или `suffix` поле — текстовое (`inputMode="decimal"`): при `groupThousands` разряды
 * разделяются при показе (после blur); `suffix` — подпись справа (руб., шт.). В `onChange` у `target.value`
 * — каноническая строка без разделителей тысяч (для передачи в API / состояние).
 */
export function NumberField({
	id: idProp,
	label,
	labelMode = "above",
	value,
	defaultValue,
	onChange,
	name,
	placeholder,
	disabled,
	required,
	min,
	max,
	step = 1,
	error,
	helperText,
	fullWidth = false,
	groupThousands = false,
	thousandsSeparator = DEFAULT_THOUSANDS_SEP,
	suffix,
}) {
	const autoId = useId();
	const fieldId = idProp || autoId;
	const helperId = `${fieldId}-helper`;
	const [focused, setFocused] = useState(false);

	const formattedMode = Boolean(groupThousands || suffix);

	if (!formattedMode) {
		const { value: v, setValue, filled, isControlled } = usePlainFilledState(
			value === undefined ? undefined : String(value),
			defaultValue === undefined ? undefined : String(defaultValue),
		);
		const floating = labelMode === "floating";

		const handleChange = (e) => {
			const raw = e.target.value;
			if (max !== undefined && raw !== "") {
				const n = Number(raw);
				if (!Number.isNaN(n) && n > max) {
					e.target.value = String(max);
				}
			}
			if (!isControlled) setValue(e.target.value);
			onChange?.(e);
		};

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
				focused={focused}
			>
				<BaseInput
					type="number"
					name={name}
					placeholder={floating ? undefined : placeholder}
					min={min}
					max={max}
					step={step}
					value={isControlled ? value : undefined}
					defaultValue={isControlled ? undefined : defaultValue}
					onChange={handleChange}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					disabled={disabled}
					required={required}
					$frameless={floating}
					$floating={floating}
					$focused={focused}
					$error={Boolean(error)}
				/>
			</FieldShell>
		);
	}

	const isControlled = value !== undefined;
	const [text, setText] = useState(() =>
		initialDisplayText(value, defaultValue, groupThousands, thousandsSeparator),
	);

	useEffect(() => {
		if (!isControlled || focused) return;
		setText(initialDisplayText(value, undefined, groupThousands, thousandsSeparator));
	}, [value, focused, isControlled, groupThousands, thousandsSeparator]);

	const canonForHidden = canonicalFromRaw(text, thousandsSeparator);
	const filled = useMemo(() => canonForHidden.length > 0, [canonForHidden]);
	const floating = labelMode === "floating";
	const showError = Boolean(error);
	const describedBy = helperText || error ? helperId : undefined;

	const emit = (nextCanon) => {
		const target = { value: nextCanon, name, id: fieldId };
		onChange?.({ target, currentTarget: target });
	};

	const handleFormattedChange = (e) => {
		let typed = cleanTyping(e.target.value, thousandsSeparator);
		let c = typed;
		if (max !== undefined && c !== "" && c !== "-" && c !== "." && c !== "-.") {
			const n = Number(c);
			if (!Number.isNaN(n) && n > max) {
				c = String(max);
				typed = c;
			}
		}
		setText(typed);
		emit(c);
	};

	const handleFocus = () => {
		setFocused(true);
		const c = canonicalFromRaw(text, thousandsSeparator);
		if (groupThousands && c) setText(c);
	};

	const handleBlur = () => {
		setFocused(false);
		let c = cleanTyping(text, thousandsSeparator);
		c = clampCanonical(c, min, max);
		setText(groupThousands && c ? formatCanonicalWithThousands(c, thousandsSeparator) : c);
		emit(c);
	};

	const inner = (
		<NumberRow>
			{name ? (
				<NumberHidden
					type="hidden"
					name={name}
					value={canonForHidden}
					readOnly
					tabIndex={-1}
					aria-hidden
				/>
			) : null}
			<NumberFlexInput
				id={fieldId}
				type="text"
				inputMode="decimal"
				autoComplete="off"
				placeholder={floating ? undefined : placeholder}
				disabled={disabled}
				required={required}
				aria-invalid={showError || undefined}
				aria-describedby={describedBy}
				value={text}
				onChange={handleFormattedChange}
				onFocus={handleFocus}
				onBlur={handleBlur}
				$frameless={floating}
				$floating={floating}
				$focused={focused}
				$error={showError}
			/>
			{suffix ? <NumberSuffixEl>{suffix}</NumberSuffixEl> : null}
		</NumberRow>
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
			focused={focused}
			attachAriaToChild={false}
		>
			{inner}
		</FieldShell>
	);
}
