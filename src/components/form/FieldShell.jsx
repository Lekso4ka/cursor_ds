import React, { useId } from "react";
import {
	FieldRoot,
	AboveLabel,
	FloatingFrame,
	FloatingLabel,
	HelperText,
} from "./FieldShell.styles";

/**
 * Один визуальный контрол для оболочки: игнорируем `null`/`false` и строки из одних пробелов/переносов
 * (они появляются при форматировании JSX вокруг выражения вроде `{inner}`).
 */
function resolveSingleChild(children) {
	const nodes = React.Children.toArray(children).filter((node) => {
		if (node == null || node === false) return false;
		if (typeof node === "string") return node.trim().length > 0;
		return true;
	});

	if (nodes.length === 0) {
		throw new Error("FieldShell requires one child element; received none (after trimming empty text nodes).");
	}
	if (nodes.length > 1) {
		throw new Error(
			`FieldShell requires exactly one child element; received ${nodes.length} (after trimming empty text nodes).`,
		);
	}

	const only = nodes[0];
	if (!React.isValidElement(only)) {
		throw new Error("FieldShell child must be a single React element.");
	}
	return only;
}

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
 *   children: React.ReactNode,
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

	const child = resolveSingleChild(children);
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
