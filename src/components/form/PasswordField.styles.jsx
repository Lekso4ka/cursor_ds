import styled from "@emotion/styled";
import { formTokens as t } from "./tokens";

export const PasswordWrap = styled.div`
	position: relative;
	width: 100%;
	display: flex;
	align-items: stretch;
`;

export const PasswordToggle = styled.button`
	position: absolute;
	right: 6px;
	top: 50%;
	transform: translateY(-50%);
	border: none;
	background: rgba(255, 255, 255, 0.08);
	color: ${t.muted};
	border-radius: 8px;
	padding: 8px 10px;
	font-size: 12px;
	cursor: pointer;
	transition: background 0.15s ease, color 0.15s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.14);
		color: ${t.fg};
	}
`;
