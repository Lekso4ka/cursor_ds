import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const Root = styled.div`
	position: relative;
	width: ${(p) => (p.$fullWidth ? "100%" : "auto")};
	max-width: ${(p) => (p.$fullWidth ? "none" : "520px")};
	display: flex;
	flex-direction: column;
	gap: 10px;
	opacity: ${(p) => (p.$disabled ? 0.55 : 1)};
	pointer-events: ${(p) => (p.$disabled ? "none" : "auto")};
	border-radius: ${(p) => (p.$dropOutline ? "10px" : "0")};
	outline: ${(p) => (p.$dropOutline ? `1px dashed ${t.accent}` : "none")};
	outline-offset: 2px;
`;

export const Label = styled.label`
	font-size: 13px;
	font-weight: 600;
	letter-spacing: 0.01em;
	color: ${(p) => (p.$error ? t.error : t.muted)};
`;

export const Helper = styled.div`
	font-size: 12px;
	line-height: 1.35;
	color: ${(p) => (p.$error ? t.error : t.muted)};
	min-height: ${(p) => (p.$preserveHelper ? "16px" : "0")};
`;

export const HiddenInput = styled.input`
	position: absolute;
	width: 0;
	height: 0;
	opacity: 0;
	pointer-events: none;
`;

export const DropZone = styled.div`
	position: relative;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$error ? `1px dashed ${t.error}` : p.$active ? `1px dashed ${t.accent}` : t.border)};
	background: ${t.bg};
	padding: ${(p) => (p.$compact ? "12px 14px" : "20px 16px")};
	text-align: center;
	cursor: ${(p) => (p.$disabled ? "not-allowed" : "pointer")};
	transition: border-color 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
	outline: none;

	&:hover:not([aria-disabled="true"]) {
		border-color: ${(p) => (!p.$error ? "rgba(255,255,255,0.35)" : undefined)};
	}

	&:focus-visible {
		box-shadow: 0 0 0 1px ${t.accent};
		border-color: ${t.accent};
	}
`;

export const DropHint = styled.div`
	font-size: 14px;
	color: ${t.fg};
	line-height: 1.45;
	margin-bottom: ${(p) => (p.$withButton ? "10px" : "0")};
`;

export const DropSub = styled.div`
	font-size: 12px;
	color: ${t.muted};
	margin-top: 6px;
`;

export const SelectButton = styled.button`
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 8px 16px;
	border-radius: 8px;
	border: 1px solid rgba(255, 255, 255, 0.28);
	background: rgba(255, 255, 255, 0.1);
	color: ${t.fg};
	font-size: 14px;
	font-weight: 600;
	cursor: pointer;
	transition: background 0.15s ease, border-color 0.15s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.14);
		border-color: rgba(255, 255, 255, 0.4);
	}
`;

export const Toolbar = styled.div`
	display: flex;
	justify-content: flex-start;
`;

export const List = styled.ul`
	list-style: none;
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

export const Row = styled.li`
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border-radius: ${t.radius}px;
	border: ${t.border};
	background: rgba(0, 0, 0, 0.2);
	min-height: 52px;
`;

export const ThumbWrap = styled.div`
	width: 44px;
	height: 44px;
	flex-shrink: 0;
	border-radius: 6px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.06);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 11px;
	color: ${t.muted};
`;

export const ThumbImg = styled.img`
	width: 100%;
	height: 100%;
	object-fit: cover;
`;

export const Meta = styled.div`
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
	gap: 4px;
`;

export const Name = styled.div`
	font-size: 13px;
	font-weight: 600;
	color: ${t.fg};
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
`;

export const SizeLine = styled.div`
	font-size: 11px;
	color: ${t.muted};
`;

export const ProgressTrack = styled.div`
	height: 4px;
	border-radius: 999px;
	background: rgba(255, 255, 255, 0.12);
	overflow: hidden;
	width: 100%;
`;

export const ProgressFill = styled.div`
	height: 100%;
	width: ${(p) => `${Math.round((p.$p ?? 0) * 100)}%`};
	background: ${t.accent};
	border-radius: 999px;
	transition: width 0.12s ease-out;
`;

export const RemoveBtn = styled.button`
	flex-shrink: 0;
	width: 32px;
	height: 32px;
	border-radius: 8px;
	border: none;
	background: rgba(255, 255, 255, 0.08);
	color: ${t.muted};
	font-size: 18px;
	line-height: 1;
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center;
	transition: background 0.15s ease, color 0.15s ease;

	&:hover {
		background: rgba(252, 165, 165, 0.2);
		color: ${t.error};
	}
`;
