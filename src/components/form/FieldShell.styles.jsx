import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const FieldRoot = styled.div`
	width: ${(p) => (p.$fullWidth ? "100%" : "auto")};
	max-width: ${(p) => (p.$fullWidth ? "none" : "360px")};
	display: flex;
	flex-direction: column;
	gap: 6px;
	opacity: ${(p) => (p.$disabled ? 0.55 : 1)};
	pointer-events: ${(p) => (p.$disabled ? "none" : "auto")};
`;

export const AboveLabel = styled.label`
	font-size: 13px;
	font-weight: 600;
	letter-spacing: 0.01em;
	color: ${(p) => (p.$error ? t.error : t.muted)};
`;

export const FloatingFrame = styled.div`
	position: relative;
	display: flex;
	align-items: stretch;
	border-radius: ${t.radius}px;
	border: ${(p) => (p.$error ? `1px solid ${t.error}` : t.border)};
	background: ${t.bg};
	transition: border-color 0.15s ease, box-shadow 0.15s ease;
	box-shadow: ${(p) => (p.$focused ? `0 0 0 1px ${t.accent}` : "none")};
	border-color: ${(p) => {
		if (p.$error) return t.error;
		if (p.$focused) return t.accent;
		return undefined;
	}};

	&:hover {
		border-color: ${(p) => (!p.$focused && !p.$error ? "rgba(255,255,255,0.35)" : undefined)};
	}
`;

export const FloatingLabel = styled.label`
	position: absolute;
	left: 14px;
	right: 14px;
	top: ${(p) => (p.$float ? "10px" : "50%")};
	transform: ${(p) =>
		p.$float ? "translateY(0) scale(0.82)" : "translateY(-50%) scale(1)"};
	transform-origin: left center;
	font-size: 16px;
	line-height: 1;
	color: ${(p) => {
		if (p.$error) return t.error;
		if (p.$float && p.$focused) return t.accent;
		if (p.$float) return t.muted;
		return "rgba(236,236,236,0.45)";
	}};
	pointer-events: none;
	transition: top 0.18s ease, transform 0.18s ease, color 0.18s ease;
	z-index: 1;
`;

export const HelperText = styled.div`
	font-size: 12px;
	line-height: 1.35;
	color: ${(p) => (p.$error ? t.error : t.muted)};
	min-height: ${(p) => (p.$preserveSpace ? "16px" : "0")};
`;
