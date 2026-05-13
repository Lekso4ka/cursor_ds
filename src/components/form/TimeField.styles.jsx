import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const TimeHidden = styled.input`
	position: absolute;
	width: 1px;
	height: 1px;
	padding: 0;
	margin: -1px;
	overflow: hidden;
	clip: rect(0, 0, 0, 0);
	white-space: nowrap;
	border: 0;
	opacity: 0;
	pointer-events: none;
`;

export const TimeInputRow = styled.div`
	display: flex;
	align-items: stretch;
	gap: 8px;
	width: 100%;
	min-width: 0;
`;

export const TimeTextInput = styled.input`
	flex: 1;
	min-width: 0;
	box-sizing: border-box;
	font: inherit;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$frameless ? "none" : t.border)};
	background: ${(p) => (p.$frameless ? "transparent" : t.bg)};
	color: ${t.fg};
	font-size: 16px;
	line-height: 1.25;
	padding: ${(p) => (p.$floating ? "22px 14px 10px 14px" : "12px 14px")};
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

	&::placeholder {
		color: rgba(236, 236, 236, 0.35);
	}
`;

export const TimeCalButton = styled.button`
	flex: 0 0 44px;
	width: 44px;
	min-height: 48px;
	align-self: stretch;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$frameless ? "none" : t.border)};
	background: ${(p) => (p.$frameless ? "transparent" : t.bg)};
	color: ${t.muted};
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	transition: border-color 0.15s ease, background 0.15s ease, color 0.15s ease;
	box-shadow: ${(p) =>
		!p.$frameless && p.$focused ? `0 0 0 1px ${t.accent}` : "none"};
	border-color: ${(p) => {
		if (p.$frameless) return "transparent";
		if (p.$error) return t.error;
		if (p.$focused) return t.accent;
		return undefined;
	}};

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.1);
		color: ${t.fg};
		border-color: ${(p) =>
			p.$frameless || p.$focused || p.$error ? undefined : "rgba(255,255,255,0.35)"};
	}

	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}
`;

export const TimePop = styled.div`
	padding: 12px;
	background: ${t.bgElevated};
	border: ${t.border};
	border-radius: ${t.radius}px;
	box-shadow: ${t.shadow};
`;

export const TimeColumns = styled.div`
	display: grid;
	grid-template-columns: ${(p) => (p.$hour12 ? "minmax(0, 1fr) minmax(0, 1fr) 72px" : "1fr 1fr")};
	gap: 10px;
	min-height: 0;
`;

export const TimeCol = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 0;
`;

export const TimeColTitle = styled.div`
	font-size: 12px;
	font-weight: 600;
	color: ${t.muted};
	margin-bottom: 6px;
`;

export const TimeScrollList = styled.div`
	overflow: auto;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.12);
	padding: 4px;
`;

export const TimeBtn = styled.button`
	width: 100%;
	border: none;
	background: ${(p) => (p.$active ? "rgba(125,211,252,0.18)" : "transparent")};
	color: ${t.fg};
	border-radius: 6px;
	padding: 8px 8px;
	cursor: pointer;
	font-size: 14px;
	text-align: center;

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
	}

	&:disabled {
		opacity: 0.3;
		cursor: default;
	}
`;

export const TimeRoot = styled.div`
	position: relative;
	width: 100%;
`;
