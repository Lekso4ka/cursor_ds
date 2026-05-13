import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const SelectRoot = styled.div`
	position: relative;
	width: 100%;
`;

export const SelectControl = styled.div`
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
	flex-direction: ${(p) => (p.$stackChips ? "column" : "row")};
	flex-wrap: nowrap;
	align-items: ${(p) => {
		if (p.$allowGrow && p.$stackChips) return "stretch";
		return "center";
	}};
	gap: ${(p) => (p.$stackChips || p.$inlineChips ? "8px" : "0")};
	padding: ${(p) => {
		if (p.$floating) return p.$stackChips ? "4px" : "4px 4px";
		return p.$stackChips ? "8px 10px" : "0 14px";
	}};
	${(p) => {
		if (p.$allowGrow) {
			return `
				min-height: 48px;
				height: auto;
				max-height: none;
				overflow: visible;
			`;
		}
		if (p.$floating) {
			return `
				min-height: 48px;
				overflow: hidden;
			`;
		}
		return `
			height: 48px;
			min-height: 48px;
			max-height: 48px;
			overflow: hidden;
		`;
	}}

	&:hover {
		border-color: ${(p) =>
			!p.$floating && !p.$focused && !p.$error ? "rgba(255,255,255,0.35)" : undefined};
	}
`;

export const SelectChipsRow = styled.div`
	display: flex;
	gap: 6px;
	align-items: center;
	min-width: 0;
	flex: ${(p) => (p.$expandable ? "0 1 auto" : "1 1 0%")};
	overflow: ${(p) => (p.$expandable ? "visible" : "hidden")};
	flex-wrap: ${(p) => (p.$expandable ? "wrap" : "nowrap")};
`;

export const SelectChip = styled.button`
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.1);
	color: ${t.fg};
	border-radius: 999px;
	padding: 4px 10px;
	font-size: 13px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	max-width: ${(p) => (p.$expandable ? "100%" : "40%")};
	min-width: 0;
	flex: ${(p) => (p.$expandable ? "0 0 auto" : "0 1 auto")};
	flex-shrink: 1;

	&:hover {
		background: rgba(255, 255, 255, 0.16);
	}
`;

export const SelectChipLabel = styled.span`
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	min-width: 0;
`;

export const SelectSearch = styled.input`
	width: 100%;
	min-width: 0;
	flex: ${(p) => (p.$onlyInput ? "1 1 auto" : "1 1 120px")};
	border: none;
	outline: none;
	background: transparent;
	color: ${t.fg};
	font-size: 16px;
	line-height: 1.25;
	padding: ${(p) => {
		if (p.$floating) return p.$stackChips ? "20px 4px 6px 4px" : "22px 4px 10px 4px";
		return "12px 0";
	}};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;

	&::placeholder {
		color: rgba(236, 236, 236, 0.35);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
`;

export const SelectDropdown = styled.ul`
	position: absolute;
	left: 0;
	right: 0;
	margin: 0;
	padding: 6px;
	list-style: none;
	background: ${t.bgElevated};
	border: ${t.border};
	border-radius: ${t.radius}px;
	box-shadow: ${t.shadow};
	overflow-x: hidden;
`;

export const SelectEmptyHint = styled.div`
	padding: 10px 12px;
	font-size: 14px;
	color: ${t.muted};
`;

export const SelectOption = styled.li`
	padding: 10px 12px;
	border-radius: 8px;
	cursor: pointer;
	font-size: 14px;
	color: ${t.fg};
	background: ${(p) => (p.$active ? "rgba(125,211,252,0.12)" : "transparent")};

	&:hover {
		background: rgba(255, 255, 255, 0.08);
	}
`;
