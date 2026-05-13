import React, { useId, useMemo, useState } from "react";
import { FieldShell } from "./FieldShell";
import { BaseInput } from "./BaseInput";
import { PasswordWrap, PasswordToggle } from "./PasswordField.styles";

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
 *   visibilityToggle?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 * }} props
 */
export function PasswordField({
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
	autoComplete = "current-password",
	visibilityToggle = true,
	error,
	helperText,
	fullWidth = false,
}) {
	const autoId = useId();
	const fieldId = id ?? autoId;
	const [focused, setFocused] = useState(false);
	const [visible, setVisible] = useState(false);
	const { setValue, filled, isControlled } = useFilledState(value, defaultValue);

	const handleChange = (e) => {
		if (!isControlled) setValue(e.target.value);
		onChange?.(e);
	};

	const floating = labelMode === "floating";
	const showToggle = visibilityToggle && !disabled;
	const helperId = `${fieldId}-helper`;
	const showError = Boolean(error);
	const describedBy = helperText || showError ? helperId : undefined;

	const innerInput = (
		<BaseInput
			id={fieldId}
			type={visible ? "text" : "password"}
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
			aria-invalid={showError || undefined}
			aria-describedby={describedBy}
			$frameless={floating}
			$floating={floating}
			$withEnd={showToggle}
			$focused={focused}
			$error={showError}
		/>
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
			{showToggle ? (
				<PasswordWrap>
					{innerInput}
					<PasswordToggle
						type="button"
						tabIndex={-1}
						onMouseDown={(e) => e.preventDefault()}
						onClick={() => setVisible((x) => !x)}
					>
						{visible ? "Скрыть" : "Показать"}
					</PasswordToggle>
				</PasswordWrap>
			) : (
				innerInput
			)}
		</FieldShell>
	);
}
