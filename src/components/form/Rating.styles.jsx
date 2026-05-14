import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const RatingRoot = styled.div`
	display: inline-flex;
	flex-direction: row;
	flex-wrap: wrap;
	align-items: center;
	gap: ${(p) => (p.$gap != null ? `${p.$gap}px` : "6px")};
	max-width: 100%;
	opacity: ${(p) => (p.$disabled ? 0.55 : 1)};
	pointer-events: ${(p) => (p.$disabled ? "none" : "auto")};
`;

export const RatingLabel = styled.div`
	width: 100%;
	font-size: 13px;
	font-weight: 600;
	color: ${t.muted};
	margin-bottom: 2px;
`;

export const StarsRow = styled.div`
	display: inline-flex;
	align-items: center;
	gap: ${(p) => p.$starGap + "px"};
`;

export const StarSlot = styled.span`
	position: relative;
	display: inline-flex;
	flex-shrink: 0;
	width: ${(p) => p.$size + "px"};
	height: ${(p) => p.$size + "px"};
`;

export const StarHit = styled.button`
	position: absolute;
	top: 0;
	left: 0;
	height: 100%;
	width: ${(p) => (p.$full ? "100%" : "50%")};
	padding: 0;
	margin: 0;
	border: none;
	background: transparent;
	cursor: pointer;
	z-index: 2;
	color: transparent;

	&:disabled {
		cursor: not-allowed;
	}

	&:focus-visible {
		outline: 2px solid ${t.accent};
		outline-offset: 2px;
		border-radius: 4px;
	}
`;

export const StarHitRight = styled(StarHit)`
	left: 50%;
	width: 50%;
`;

export const StarSvgWrap = styled.span`
	position: absolute;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	pointer-events: none;
`;

export const VoteCount = styled.span`
	font-size: ${(p) => p.$fontSize + "px"};
	color: ${t.muted};
	margin-left: 2px;
	white-space: nowrap;
`;

export const HelperLine = styled.div`
	flex: 1 0 100%;
	width: 100%;
	font-size: 12px;
	line-height: 1.35;
	color: ${(p) => (p.$error ? t.error : t.muted)};
	margin-top: 4px;
	min-height: ${(p) => (p.$preserve ? "16px" : "0")};
`;
