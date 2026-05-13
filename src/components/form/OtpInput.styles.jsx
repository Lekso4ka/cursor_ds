import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const OtpGroup = styled.div`
	display: flex;
	gap: 8px;
	width: 100%;
	align-items: stretch;
`;

export const OtpDigit = styled.input`
	width: 1.25em;
	min-width: 0;
	flex: 1 1 0;
	max-width: 52px;
	text-align: center;
	box-sizing: border-box;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$frameless ? "none" : t.border)};
	background: ${(p) => (p.$frameless ? "transparent" : t.bg)};
	color: ${t.fg};
	font-size: 18px;
	font-weight: 600;
	line-height: 1.2;
	padding: ${(p) =>
		p.$floating ? "22px 6px 10px 6px" : p.$withEnd ? "12px 6px 12px 6px" : "12px 6px"};
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

	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
`;
