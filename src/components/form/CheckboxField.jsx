import React, { useId } from "react";
import { FieldRoot, HelperText } from "./FieldShell.styles";
import { CheckboxRow, CheckboxInput, CheckboxLabelText } from "./CheckboxField.styles";

/**
 * Чекбокс с подписью справа, подсказкой и ошибкой в стиле остальных полей.
 *
 * @param {{
 *   id?: string,
 *   label?: string,
 *   checked?: boolean,
 *   defaultChecked?: boolean,
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   name?: string,
 *   value?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 * }} props
 */
export function CheckboxField({
	id: idProp,
	label,
	checked,
	defaultChecked,
	onChange,
	name,
	value,
	disabled,
	required,
	error,
	helperText,
	fullWidth = false,
}) {
	const autoId = useId();
	const id = idProp || autoId;
	const helperId = `${id}-helper`;
	const errorText = typeof error === "string" ? error : error ? "Ошибка" : "";
	const showError = Boolean(error);
	const helper = showError ? errorText : helperText || "";
	const describedBy = helper ? helperId : undefined;

	return (
		<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
			<CheckboxRow as="label" $disabled={disabled}>
				<CheckboxInput
					id={id}
					type="checkbox"
					name={name}
					value={value}
					checked={checked}
					defaultChecked={defaultChecked}
					onChange={onChange}
					disabled={disabled}
					required={required}
					$disabled={disabled}
					aria-invalid={showError || undefined}
					aria-describedby={describedBy}
				/>
				{label ? <CheckboxLabelText>{label}</CheckboxLabelText> : null}
			</CheckboxRow>
			<HelperText id={helperId} $error={showError}>
				{helper}
			</HelperText>
		</FieldRoot>
	);
}
