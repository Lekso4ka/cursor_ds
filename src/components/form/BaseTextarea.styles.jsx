import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

/** Многострочное поле в том же визуальном языке, что и BaseInput. */
export const BaseTextarea = styled.textarea`
	color-scheme: dark;
	width: 100%;
	box-sizing: border-box;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$frameless ? "none" : t.border)};
	background: ${(p) => (p.$frameless ? "transparent" : t.bg)};
	color: ${t.fg};
	font-size: 16px;
	line-height: 1.25;
	font-family: inherit;
	padding: ${(p) => (p.$floating ? "22px 14px 10px 14px" : "12px 14px")};
	outline: none;
	resize: vertical;
	min-height: ${(p) => (p.$minHeight ? `${p.$minHeight}px` : "auto")};
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
		resize: none;
	}
`;
