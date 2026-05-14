import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const TagInputRoot = styled.div`
	position: relative;
	width: 100%;
`;

/** Рамка как у поля: чипы + строка ввода. */
export const TagShell = styled.div`
	position: relative;
	box-sizing: border-box;
	border-radius: ${t.radius}px;
	border: ${(p) => {
		if (p.$floating) return "none";
		return p.$error ? `1px solid ${t.error}` : t.border;
	}};
	background: ${(p) => (p.$floating ? "transparent" : t.bg)};
	box-shadow: ${(p) => (!p.$floating && p.$focused ? `0 0 0 1px ${t.accent}` : "none")};
	border-color: ${(p) => {
		if (p.$floating) return "transparent";
		if (p.$error) return t.error;
		if (p.$focused) return t.accent;
		return undefined;
	}};
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 6px;
	padding: ${(p) => (p.$floating ? "8px 10px 8px 10px" : "8px 10px")};
	min-height: 48px;
	max-height: ${(p) => (p.$expandable ? "none" : "120px")};
	overflow-y: ${(p) => (p.$expandable ? "visible" : "auto")};

	&:hover {
		border-color: ${(p) =>
			!p.$floating && !p.$focused && !p.$error ? "rgba(255,255,255,0.35)" : undefined};
	}
`;

export const TagChip = styled.span`
	display: inline-flex;
	align-items: center;
	gap: 4px;
	max-width: 100%;
	padding: 4px 6px 4px 10px;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.22);
	background: rgba(255, 255, 255, 0.1);
	color: ${t.fg};
	font-size: 13px;
	line-height: 1.2;
`;

export const TagChipLabel = styled.span`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
`;

export const TagChipRemove = styled.button`
	flex: 0 0 auto;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 20px;
	height: 20px;
	padding: 0;
	border: none;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.12);
	color: ${t.muted};
	font-size: 14px;
	line-height: 1;
	cursor: pointer;

	&:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.22);
		color: ${t.fg};
	}

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}
`;

export const TagNativeInput = styled.input`
	flex: 1 1 120px;
	min-width: 80px;
	border: none;
	outline: none;
	background: transparent;
	color: ${t.fg};
	font-size: 15px;
	line-height: 1.35;
	padding: 4px 2px;

	&::placeholder {
		color: rgba(236, 236, 236, 0.35);
	}

	&:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
`;

export const TagHidden = styled.input`
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

export const TagSuggestPop = styled.ul`
	position: absolute;
	left: 0;
	right: 0;
	top: calc(100% + 4px);
	z-index: 25;
	margin: 0;
	padding: 4px;
	list-style: none;
	background: ${t.bgElevated};
	border: ${t.border};
	border-radius: ${t.radius}px;
	box-shadow: ${t.shadow};
	max-height: 200px;
	overflow-y: auto;
`;

export const TagSuggestItem = styled.li`
	padding: 8px 10px;
	border-radius: 6px;
	cursor: pointer;
	font-size: 14px;
	color: ${t.fg};

	&:hover,
	&[data-active="true"] {
		background: rgba(255, 255, 255, 0.08);
	}
`;

export const TagInlineHint = styled.div`
	font-size: 12px;
	color: ${t.error};
	margin-top: 4px;
	min-height: 1em;
`;
