import styled from "@emotion/styled";
import { BaseInput } from "./BaseInput.styles";
import { formTokens as t } from "./tokens";

/** Строка: поле + суффикс (руб., шт.) в одной рамке floating / above. */
export const NumberRow = styled.div`
	position: relative;
	display: flex;
	align-items: center;
	gap: 8px;
	width: 100%;
	min-width: 0;
`;

export const NumberFlexInput = styled(BaseInput)`
	flex: 1 1 0;
	min-width: 0;
	width: auto;
`;

export const NumberSuffixEl = styled.span`
	flex: 0 1 auto;
	max-width: 38%;
	font-size: 14px;
	line-height: 1.25;
	color: ${t.muted};
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
`;

export const NumberHidden = styled.input`
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
