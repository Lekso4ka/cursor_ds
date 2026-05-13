import React, { useMemo, useState } from "react";
import { FieldShell } from "./FieldShell";
import { BaseInput } from "./BaseInput";

function useFilledState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(
		defaultValue === undefined || defaultValue === "" ? "" : String(defaultValue),
	);
	const v = isControlled ? value : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => String(v ?? "").length > 0, [v]);
	return { value: v, setValue: setV, filled, isControlled };
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
 * }} props
 */
export function NumberField({
	id,
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
}) {
	const [focused, setFocused] = useState(false);
	const { value: v, setValue, filled, isControlled } = useFilledState(
		value === undefined ? undefined : String(value),
		defaultValue === undefined ? undefined : String(defaultValue),
	);

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

	const floating = labelMode === "floating";

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
