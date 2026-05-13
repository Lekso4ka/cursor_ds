import React, { useId } from "react";
import { FieldRoot, AboveLabel, HelperText } from "./FieldShell.styles";
import { RadioStack, RadioRow, RadioInput, RadioLabelText } from "./RadioGroup.styles";

/**
 * Одна радиокнопка с подписью (общий `name` задаётся снаружи или через RadioGroup).
 *
 * @param {{
 *   id?: string,
 *   name: string,
 *   value: string,
 *   label?: string,
 *   checked?: boolean,
 *   defaultChecked?: boolean,
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   disabled?: boolean,
 *   required?: boolean,
 * }} props
 */
export function RadioItem({
	id: idProp,
	name,
	value,
	label,
	checked,
	defaultChecked,
	onChange,
	disabled,
	required,
}) {
	const autoId = useId();
	const id = idProp || autoId;

	return (
		<RadioRow as="label" $disabled={disabled}>
			<RadioInput
				id={id}
				type="radio"
				name={name}
				value={value}
				checked={checked}
				defaultChecked={defaultChecked}
				onChange={onChange}
				disabled={disabled}
				required={required}
				$disabled={disabled}
			/>
			{label ? <RadioLabelText>{label}</RadioLabelText> : null}
		</RadioRow>
	);
}

/**
 * Группа радиокнопок с общим `name`, подписью группы и подсказкой.
 *
 * @param {{
 *   name: string,
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   options: { value: string, label: string, disabled?: boolean }[],
 *   label?: string,
 *   labelMode?: 'none' | 'above',
 *   disabled?: boolean,
 *   required?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 * }} props
 */
export function RadioGroup({
	name,
	value,
	defaultValue,
	onChange,
	options,
	label,
	labelMode = "above",
	disabled,
	required,
	error,
	helperText,
	fullWidth = false,
}) {
	const groupId = useId();
	const helperId = `${groupId}-helper`;
	const errorText = typeof error === "string" ? error : error ? "Ошибка" : "";
	const showError = Boolean(error);
	const helper = showError ? errorText : helperText || "";
	const describedBy = helper ? helperId : undefined;
	const hasLabel = Boolean(label && label.length);
	const mode = hasLabel ? labelMode : "none";

	return (
		<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
			{mode === "above" ? (
				<AboveLabel as="div" id={`${groupId}-legend`} $error={showError}>
					{label}
				</AboveLabel>
			) : null}
			<RadioStack
				role="radiogroup"
				aria-labelledby={mode === "above" ? `${groupId}-legend` : undefined}
				aria-describedby={describedBy}
				aria-invalid={showError || undefined}
			>
				{options.map((opt) => (
					<RadioItem
						key={opt.value}
						name={name}
						value={opt.value}
						label={opt.label}
						checked={value !== undefined ? value === opt.value : undefined}
						defaultChecked={
							value !== undefined ? undefined : defaultValue === opt.value
						}
						onChange={onChange}
						disabled={disabled || opt.disabled}
						required={required}
					/>
				))}
			</RadioStack>
			<HelperText id={helperId} $error={showError}>
				{helper}
			</HelperText>
		</FieldRoot>
	);
}
