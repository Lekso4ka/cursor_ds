import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

/** Базовый вид поля без рамки (рамка у floating-обёртки) или с рамкой для режима «label сверху». */
export const BaseInput = styled.input`
	color-scheme: dark;
	width: 100%;
	box-sizing: border-box;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$frameless ? "none" : t.border)};
	background: ${(p) => (p.$frameless ? "transparent" : t.bg)};
	color: ${t.fg};
	font-size: 16px;
	line-height: 1.25;
	padding: ${(p) =>
		p.$floating ? "22px 14px 10px 14px" : p.$withEnd ? "12px 44px 12px 14px" : "12px 14px"};
	outline: none;
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
	box-shadow: ${(p) =>
		!p.$frameless && p.$focused ? `0 0 0 1px ${t.accent}` : "none"};
	border-color: ${(p) => {
		if (p.$frameless) return "transparent";
		if (p.$error) return t.error;
		if (p.$focused) return t.accent;
		return undefined;
	}};

	&:hover:not(:disabled) {
		border-color: ${(p) =>
			p.$frameless || p.$focused || p.$error ? undefined : "rgba(255,255,255,0.35)"};
	}

	&::placeholder {
		color: rgba(236, 236, 236, 0.35);
	}

	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
`;
