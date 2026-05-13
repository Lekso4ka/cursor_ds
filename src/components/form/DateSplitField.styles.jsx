import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const DateSplitRoot = styled.div`
	position: relative;
	width: 100%;
`;

export const DateSplitInputRow = styled.div`
	display: flex;
	align-items: stretch;
	gap: 6px;
	width: 100%;
	min-width: 0;
`;

/** Одно поле: день (2), месяц (2) или год (4) — стиль как у OTP-ячейки. */
export const DatePartInput = styled.input`
	width: 1.25em;
	min-width: 0;
	flex: ${(p) => (p.$wide ? "1.4 1 0" : "1 1 0")};
	max-width: ${(p) => (p.$wide ? "88px" : "48px")};
	text-align: center;
	box-sizing: border-box;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$frameless ? "none" : t.border)};
	background: ${(p) => (p.$frameless ? "transparent" : t.bg)};
	color: ${t.fg};
	font-size: 17px;
	font-weight: 600;
	line-height: 1.2;
	padding: ${(p) => (p.$floating ? "22px 6px 10px 6px" : "12px 6px")};
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

export const DateSplitSep = styled.span`
	flex: 0 0 auto;
	align-self: center;
	font-size: 18px;
	font-weight: 600;
	color: ${t.muted};
	user-select: none;
	padding: 0 2px;
`;
