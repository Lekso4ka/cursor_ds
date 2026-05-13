import React, { useMemo, useState } from "react";
import { FieldShell } from "./FieldShell";
import { BaseInput } from "./BaseInput";

function useFilledState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(defaultValue ?? "");
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
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   name?: string,
 *   placeholder?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   autoComplete?: string,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'],
 *   maxLength?: number,
 * }} props
 */
export function TextField({
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
	autoComplete,
	error,
	helperText,
	fullWidth = false,
	inputMode,
	maxLength,
}) {
	const [focused, setFocused] = useState(false);
	const { value: v, setValue, filled, isControlled } = useFilledState(value, defaultValue);

	const handleChange = (e) => {
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
				type="text"
				name={name}
				placeholder={floating ? undefined : placeholder}
				value={isControlled ? value : undefined}
				defaultValue={isControlled ? undefined : defaultValue}
				onChange={handleChange}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				disabled={disabled}
				required={required}
				autoComplete={autoComplete}
				inputMode={inputMode}
				maxLength={maxLength}
				$frameless={floating}
				$floating={floating}
				$focused={focused}
				$error={Boolean(error)}
			/>
		</FieldShell>
	);
}
