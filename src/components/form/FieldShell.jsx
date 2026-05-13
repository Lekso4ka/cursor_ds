import React, { useId } from "react";
import {
	FieldRoot,
	AboveLabel,
	FloatingFrame,
	FloatingLabel,
	HelperText,
} from "./FieldShell.styles";

/**
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   error?: string | boolean,
 *   helperText?: string,
 *   disabled?: boolean,
 *   fullWidth?: boolean,
 *   filled?: boolean,
 *   focused?: boolean,
 *   children: React.ReactElement,
 *   preserveHelperSpace?: boolean,
 *   attachAriaToChild?: boolean,
 * }} props
 */
export function FieldShell({
	id: idProp,
	label,
	labelMode = "above",
	error,
	helperText,
	disabled,
	fullWidth = false,
	filled = false,
	focused = false,
	children,
	preserveHelperSpace = true,
	attachAriaToChild = true,
}) {
	const autoId = useId();
	const id = idProp || autoId;
	const helperId = `${id}-helper`;
	const hasLabel = Boolean(label && label.length);
	const mode = hasLabel ? labelMode : "none";
	const errorText = typeof error === "string" ? error : error ? "Ошибка" : "";
	const showError = Boolean(error);
	const helper = showError ? errorText : helperText || "";

	const float = focused || filled;

	const describedBy = helper ? helperId : undefined;

	const child = React.Children.only(children);
	const merged = attachAriaToChild
		? React.cloneElement(child, {
				id,
				disabled: disabled ?? child.props.disabled,
				"aria-invalid": showError || undefined,
				"aria-describedby": describedBy,
			})
		: child;

	if (mode === "floating") {
		return (
			<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
				<FloatingFrame $error={showError} $focused={focused}>
					<FloatingLabel htmlFor={id} $float={float} $focused={focused} $error={showError}>
						{label}
					</FloatingLabel>
					{merged}
				</FloatingFrame>
				<HelperText id={helperId} $error={showError} $preserveSpace={preserveHelperSpace}>
					{helper}
				</HelperText>
			</FieldRoot>
		);
	}

	if (mode === "above") {
		return (
			<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
				<AboveLabel htmlFor={id} $error={showError}>
					{label}
				</AboveLabel>
				{merged}
				<HelperText id={helperId} $error={showError} $preserveSpace={preserveHelperSpace}>
					{helper}
				</HelperText>
			</FieldRoot>
		);
	}

	return (
		<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
			{merged}
			<HelperText id={helperId} $error={showError} $preserveSpace={preserveHelperSpace}>
				{helper}
			</HelperText>
		</FieldRoot>
	);
}
