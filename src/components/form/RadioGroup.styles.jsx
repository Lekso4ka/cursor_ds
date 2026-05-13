import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const RadioStack = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`;

export const RadioRow = styled.label`
	display: inline-flex;
	align-items: flex-start;
	gap: 10px;
	cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
	user-select: none;
	font-size: 15px;
	line-height: 1.35;
	color: ${t.fg};
`;

export const RadioInput = styled.input`
	width: 18px;
	height: 18px;
	margin: 2px 0 0;
	flex-shrink: 0;
	accent-color: ${t.accent};
	cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
`;

export const RadioLabelText = styled.span`
	color: ${(p) => (p.$muted ? t.muted : t.fg)};
`;
