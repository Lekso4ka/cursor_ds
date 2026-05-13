import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const RangeTrackWrap = styled.div`
	position: relative;
	width: 100%;
	height: 32px;
	display: flex;
	align-items: center;
`;

/** Один ребёнок для FieldShell: слайдер + опциональный блок подписей под дорожкой. */
export const RangeSingleShell = styled.div`
	width: 100%;
`;

/** Два ползунка в одной дорожке: у верхнего слоя отключены события, кроме thumb (WebKit / Firefox). */
export const RangeDualInput = styled.input`
	position: absolute;
	left: 0;
	right: 0;
	width: 100%;
	height: 32px;
	margin: 0;
	background: transparent;
	appearance: none;
	pointer-events: none;
	z-index: ${(p) => p.$z};
	accent-color: ${t.accent};

	&::-webkit-slider-thumb {
		pointer-events: auto;
		appearance: none;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: ${t.accent};
		border: 2px solid #0f1115;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
		cursor: pointer;
	}

	&::-moz-range-thumb {
		pointer-events: auto;
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: ${t.accent};
		border: 2px solid #0f1115;
		box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.35);
		cursor: pointer;
	}

	&::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
	}
	&::-moz-range-track {
		height: 4px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
	}

	&:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
`;

export const RangeSingleInput = styled.input`
	width: 100%;
	height: 32px;
	margin: 0;
	accent-color: ${t.accent};
	background: transparent;
	appearance: none;

	&::-webkit-slider-runnable-track {
		height: 4px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
	}
	&::-moz-range-track {
		height: 4px;
		border-radius: 999px;
		background: rgba(255, 255, 255, 0.12);
	}

	&:disabled {
		opacity: 0.55;
		cursor: not-allowed;
	}
`;

export const RangeBoundsRow = styled.div`
	display: flex;
	justify-content: space-between;
	gap: 12px;
	font-size: 12px;
	color: ${t.muted};
	margin-top: 2px;
`;

export const RangeValueRow = styled.div`
	display: flex;
	justify-content: ${(p) => (p.$variant === "center" ? "center" : "space-between")};
	align-items: center;
	gap: 12px;
	font-size: 13px;
	color: ${t.muted};
	margin-top: 4px;

	& strong {
		color: ${t.fg};
		font-weight: 650;
	}
`;
