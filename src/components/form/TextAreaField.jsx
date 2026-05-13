import React, { useMemo, useState } from "react";
import { FieldShell } from "./FieldShell";
import { BaseTextarea } from "./BaseTextarea.styles";

function useFilledState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(defaultValue ?? "");
	const v = isControlled ? value : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => String(v ?? "").length > 0, [v]);
	return { value: v, setValue: setV, filled, isControlled };
}

/** Высота по умолчанию ≈ 3 строки однострочного поля (16px × 1.25 + вертикальные отступы). */
const DEFAULT_ROWS = 3;
const LINE_PX = 16 * 1.25;
const PAD_Y = 12 * 2;

function rowsToMinHeightPx(rows) {
	return Math.round(rows * LINE_PX + PAD_Y);
}

/**
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void,
 *   name?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   rows?: number,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   maxLength?: number,
 *   autoComplete?: string,
 * }} props
 */
export function TextAreaField({
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
	rows = DEFAULT_ROWS,
	error,
	helperText,
	fullWidth = false,
	maxLength,
	autoComplete,
}) {
	const [focused, setFocused] = useState(false);
	const { filled, isControlled, setValue } = useFilledState(value, defaultValue);
	const floating = labelMode === "floating";
	const minHeightPx = rowsToMinHeightPx(rows);

	const handleChange = (e) => {
		if (!isControlled) setValue(e.target.value);
		onChange?.(e);
	};

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
			<BaseTextarea
				name={name}
				rows={rows}
				placeholder={floating ? undefined : placeholder}
				value={isControlled ? value : undefined}
				defaultValue={isControlled ? undefined : defaultValue}
				onChange={handleChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				disabled={disabled}
				required={required}
				maxLength={maxLength}
				autoComplete={autoComplete}
				$frameless={floating}
				$floating={floating}
				$focused={focused}
				$error={Boolean(error)}
				$minHeight={minHeightPx}
			/>
		</FieldShell>
	);
}
