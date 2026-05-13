import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const DateHidden = styled.input`
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

export const DateInputRow = styled.div`
	display: flex;
	align-items: stretch;
	gap: 8px;
	width: 100%;
	min-width: 0;
`;

export const DateTextInput = styled.input`
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

export const DateCalButton = styled.button`
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

export const DatePop = styled.div`
	padding: 12px;
	background: ${t.bgElevated};
	border: ${t.border};
	border-radius: ${t.radius}px;
	box-shadow: ${t.shadow};
`;

export const DateNav = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 10px;
`;

export const DateNavBtn = styled.button`
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.08);
	color: ${t.fg};
	border-radius: 8px;
	padding: 6px 10px;
	cursor: pointer;
	font-size: 14px;

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.14);
	}

	&:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
`;

export const DateMonthTitle = styled.div`
	font-size: 14px;
	font-weight: 600;
	color: ${t.fg};
`;

export const DateTodayBtn = styled.button`
	margin-top: 10px;
	width: 100%;
	border: 1px solid rgba(125, 211, 252, 0.35);
	background: rgba(125, 211, 252, 0.1);
	color: ${t.accent};
	border-radius: 8px;
	padding: 8px 10px;
	cursor: pointer;
	font-size: 13px;
	font-weight: 600;

	&:hover:not(:disabled) {
		background: rgba(125, 211, 252, 0.18);
	}

	&:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
`;

export const DateWeekdayRow = styled.div`
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4px;
	margin-bottom: 6px;
`;

export const DateWeekday = styled.div`
	font-size: 11px;
	text-transform: uppercase;
	letter-spacing: 0.06em;
	color: ${t.muted};
	text-align: center;
`;

export const DateGrid = styled.div`
	display: grid;
	grid-template-columns: repeat(7, 1fr);
	gap: 4px;
`;

export const DateDayBtn = styled.button`
	border: 1px solid transparent;
	background: transparent;
	color: ${t.fg};
	border-radius: 8px;
	height: 34px;
	cursor: pointer;
	font-size: 14px;

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.08);
	}

	&:disabled {
		opacity: 0.28;
		cursor: default;
	}

	${(p) =>
		p.$outside &&
		`
		color: ${t.muted};
		opacity: 0.45;
	`}
	${(p) =>
		p.$today &&
		!p.$selected &&
		`
		border-color: rgba(125,211,252,0.35);
		background: rgba(125,211,252,0.08);
	`}
	${(p) =>
		p.$selected &&
		`
		background: rgba(125,211,252,0.22);
		border-color: rgba(125,211,252,0.45);
	`}
`;

export const DateRoot = styled.div`
	position: relative;
	width: 100%;
`;
