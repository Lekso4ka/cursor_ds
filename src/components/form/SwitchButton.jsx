import React, { useId, useState } from "react";
import { FieldRoot, HelperText } from "./FieldShell.styles";
import {
	SwitchRow,
	SwitchControl,
	SwitchInput,
	SwitchTrack,
	SwitchThumb,
	SwitchLabelText,
} from "./SwitchButton.styles";

/**
 * Переключатель (визуально — switch), по смыслу и для форм — `checkbox`.
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
export function SwitchButton({
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

	const isControlled = checked !== undefined;
	const [innerOn, setInnerOn] = useState(Boolean(defaultChecked));

	const isOn = isControlled ? Boolean(checked) : innerOn;

	const handleChange = (e) => {
		if (!isControlled) setInnerOn(e.target.checked);
		onChange?.(e);
	};

	return (
		<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
			<SwitchRow as="label" $disabled={disabled}>
				<SwitchControl>
					<SwitchInput
						id={id}
						type="checkbox"
						name={name}
						value={value}
						checked={checked}
						defaultChecked={isControlled ? undefined : defaultChecked}
						onChange={handleChange}
						disabled={disabled}
						required={required}
						$disabled={disabled}
						aria-invalid={showError || undefined}
						aria-describedby={describedBy}
					/>
					<SwitchTrack $checked={isOn}>
						<SwitchThumb $checked={isOn} />
					</SwitchTrack>
				</SwitchControl>
				{label ? <SwitchLabelText>{label}</SwitchLabelText> : null}
			</SwitchRow>
			<HelperText id={helperId} $error={showError}>
				{helper}
			</HelperText>
		</FieldRoot>
	);
}
