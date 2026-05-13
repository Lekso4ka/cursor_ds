import React, { useState } from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import {
	FieldShell,
	TextField,
	TextAreaField,
	NumberField,
	PasswordField,
	SelectField,
	DateField,
	DateSplitField,
	TimeField,
	OtpInput,
	CheckboxField,
	SwitchButton,
	RadioGroup,
	RadioItem,
	RangeField,
} from "../components/form";
import { BaseInput } from "../components/form/BaseInput";
import { formTokens as t } from "../components/form/tokens";

const Page = styled.main`
	min-height: 100vh;
	padding: 32px 24px 64px;
	background: radial-gradient(1200px 600px at 20% 0%, #1e293b, #0f1115);
	color: ${t.fg};
`;

const Title = styled.h1`
	margin: 0 0 8px;
	font-size: 28px;
	font-weight: 700;
	letter-spacing: -0.02em;
`;

const Lead = styled.p`
	margin: 0 0 24px;
	max-width: 760px;
	color: ${t.muted};
	line-height: 1.55;
	font-size: 15px;
`;

const BackLink = styled(Link)`
	display: inline-block;
	margin-bottom: 20px;
	color: #93c5fd;
	font-size: 14px;
	text-decoration: none;
	&:hover {
		text-decoration: underline;
	}
`;

const Form = styled.form`
	max-width: 900px;
	display: flex;
	flex-direction: column;
	gap: 20px;
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 18px 22px;
	align-items: start;
`;

const SubmitRow = styled.div`
	margin-top: 4px;
`;

const SubmitButton = styled.button`
	padding: 12px 22px;
	border-radius: 10px;
	border: none;
	font-size: 15px;
	font-weight: 600;
	cursor: pointer;
	background: linear-gradient(180deg, #38bdf8, #0ea5e9);
	color: #0f172a;
	&:hover {
		filter: brightness(1.05);
	}
`;

const CITY_OPTIONS = [
	{ value: "msk", label: "Москва" },
	{ value: "spb", label: "Санкт-Петербург" },
	{ value: "nsk", label: "Новосибирск" },
];

function collectFormData(form) {
	const fd = new FormData(form);
	const out = {};
	for (const [key, val] of fd.entries()) {
		if (out[key] !== undefined) {
			if (Array.isArray(out[key])) out[key].push(val);
			else out[key] = [out[key], val];
		} else {
			out[key] = val;
		}
	}
	return out;
}

export function FormPage() {
	const [city, setCity] = useState("msk");
	const [otp, setOtp] = useState("");

	const handleSubmit = (e) => {
		e.preventDefault();
		const form = e.currentTarget;
		const data = collectFormData(form);

		const terms = form.querySelector('input[name="terms"]');
		const mailing = form.querySelector('input[name="mailing"]');
		data.terms = terms instanceof HTMLInputElement ? terms.checked : false;
		data.mailing = mailing instanceof HTMLInputElement ? mailing.checked : false;

		data.city = city;
		data.otp = otp;

		console.log("formData", data);
	};

	return (
		<Page>
			<BackLink to="/">← На главную</BackLink>
			<Title>Форма: все компоненты</Title>
			<Lead>
				Каждый экспорт из <code>src/components/form/index.js</code> (кроме дублирующего алиаса{" "}
				<code>OTPInput</code>). Значения с <code>SelectField</code> и <code>OtpInput</code> подмешиваются из
				состояния — в DOM нет скрытых полей с этими именами.
			</Lead>

			<Form onSubmit={handleSubmit} noValidate>
				<Grid>
					<FieldShell label="Сайт (FieldShell + BaseInput)" labelMode="above" helperText="type=url">
						<BaseInput type="url" name="website" placeholder="https://example.com" />
					</FieldShell>

					<TextField label="Имя" labelMode="above" name="fullName" placeholder="Иван Иванов" />

					<TextAreaField label="О себе" labelMode="above" name="bio" rows={3} placeholder="Кратко" />

					<NumberField label="Возраст" labelMode="floating" name="age" min={0} max={120} defaultValue={25} />

					<PasswordField label="Пароль" labelMode="floating" name="password" placeholder="••••••••" />

					<SelectField
						label="Город"
						labelMode="above"
						variant="select"
						options={CITY_OPTIONS}
						value={city}
						onChange={setCity}
						placeholder="Выберите город"
						helperText="В объект — из state (city)"
					/>

					<DateField
						label="Дата события"
						labelMode="above"
						name="eventDate"
						dateInputMask="iso"
						defaultValue="2026-06-15"
					/>

					<DateSplitField
						label="Дата рождения"
						labelMode="floating"
						name="birthDate"
						dateOrder="dmy"
						dateSeparator="."
						defaultValue="1990-05-13"
						min="1950-01-01"
						max="2010-12-31"
					/>

					<TimeField label="Время" labelMode="above" name="startTime" defaultValue="14:30" />

					<OtpInput
						length={4}
						label="Код (4 цифры)"
						labelMode="above"
						name="otp"
						value={otp}
						onChange={(ev) => setOtp(ev.target.value)}
						helperText="В объект — из state (otp)"
					/>

					<CheckboxField label="Согласен с условиями" name="terms" value="yes" />

					<SwitchButton label="Рассылка" name="mailing" value="on" defaultChecked />

					<RadioGroup
						name="plan"
						label="Тариф"
						labelMode="above"
						defaultValue="pro"
						options={[
							{ value: "free", label: "Free" },
							{ value: "pro", label: "Pro" },
							{ value: "biz", label: "Biz" },
						]}
					/>

					<div>
						<div
							style={{
								fontSize: 13,
								fontWeight: 600,
								color: t.muted,
								marginBottom: 8,
							}}
						>
							RadioItem
						</div>
						<RadioItem name="ack" value="yes" label="Подтверждаю отправку данных" defaultChecked />
					</div>

					<RangeField
						label="Громкость"
						labelMode="floating"
						name="volume"
						min={0}
						max={100}
						defaultValue={42}
						showBoundsLabels
						formatValueLabel={(n) => `${n}%`}
					/>
				</Grid>

				<SubmitRow>
					<SubmitButton type="submit">Отправить</SubmitButton>
				</SubmitRow>
			</Form>
		</Page>
	);
}
