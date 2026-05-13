import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const SwitchRow = styled.label`
	display: inline-flex;
	align-items: center;
	gap: 12px;
	cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
	user-select: none;
	font-size: 15px;
	line-height: 1.35;
	color: ${t.fg};
`;

export const SwitchControl = styled.span`
	position: relative;
	display: inline-flex;
	flex-shrink: 0;
	width: 48px;
	height: 28px;
	align-items: center;
`;

/** Невидимый чекбокс поверх дорожки — клики и фокус с клавиатуры. */
export const SwitchInput = styled.input`
	position: absolute;
	inset: 0;
	width: 100%;
	height: 100%;
	margin: 0;
	opacity: 0;
	z-index: 2;
	cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};

	&:disabled {
		cursor: not-allowed;
	}

	&:focus-visible + span {
		box-shadow: 0 0 0 2px ${t.bg}, 0 0 0 4px ${t.accent};
	}
`;

export const SwitchTrack = styled.span`
	position: relative;
	display: block;
	width: 100%;
	height: 100%;
	border-radius: 999px;
	background: ${(p) =>
		p.$checked ? "rgba(125, 211, 252, 0.45)" : "rgba(255, 255, 255, 0.18)"};
	border: 1px solid
		${(p) => (p.$checked ? "rgba(125, 211, 252, 0.55)" : "rgba(255, 255, 255, 0.22)")};
	transition: background 0.2s ease, border-color 0.2s ease;
	box-sizing: border-box;
`;

export const SwitchThumb = styled.span`
	position: absolute;
	top: 50%;
	left: ${(p) => (p.$checked ? "calc(100% - 22px)" : "4px")};
	width: 22px;
	height: 22px;
	margin-top: -11px;
	border-radius: 50%;
	background: ${(p) => (p.$checked ? "#f8fafc" : "rgba(236, 236, 236, 0.95)")};
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
	transition: left 0.2s ease, background 0.2s ease;
`;

export const SwitchLabelText = styled.span`
	color: ${t.fg};
`;
