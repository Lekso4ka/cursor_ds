import React, { useState } from "react";
import styled from "@emotion/styled";
import {
	TextField,
	TextAreaField,
	NumberField,
	PasswordField,
	SelectField,
	TagInput,
	DateField,
	DateSplitField,
	TimeField,
	OtpInput,
	CheckboxField,
	SwitchButton,
	RadioGroup,
	RadioItem,
	RangeField,
	FileUpload,
	Rating,
} from "../components/form";
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
	margin: 0 0 28px;
	max-width: 720px;
	color: ${t.muted};
	line-height: 1.55;
	font-size: 15px;
`;

const Section = styled.section`
	margin-bottom: 36px;
`;

const SectionTitle = styled.h2`
	margin: 0 0 14px;
	font-size: 18px;
	font-weight: 650;
	color: #cbd5e1;
`;

const Grid = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 18px 22px;
	align-items: start;
`;

const SoloRadioBlock = styled.div`
	display: flex;
	flex-direction: column;
	gap: 8px;
`;

const SoloRadioCaption = styled.div`
	font-size: 13px;
	font-weight: 600;
	color: ${t.muted};
`;

const DEMO_OPTIONS = [
	{ value: "msk", label: "Москва" },
	{ value: "spb", label: "Санкт-Петербург" },
	{ value: "nsk", label: "Новосибирск" },
	{ value: "ekb", label: "Екатеринбург" },
	{ value: "kzn", label: "Казань" },
];

/** Даты для демо подсветки в календаре (июнь 2026). */
const DEMO_MARKED_DATES = ["2026-06-03", "2026-06-10", "2026-06-17", "2026-06-24"];

const TAG_SUGGEST = ["react", "typescript", "emotion", "webpack", "node", "css", "vite"];

async function demoFileUpload(file, { signal, onProgress }) {
	for (let i = 0; i <= 10; i++) {
		await new Promise((r) => setTimeout(r, 70));
		if (signal.aborted) throw new DOMException("aborted", "AbortError");
		onProgress(i / 10);
	}
	return { ok: true, name: file.name };
}

export function HomePage() {
	const [otpCode, setOtpCode] = useState("");
	const [creatableCityOptions, setCreatableCityOptions] = useState(DEMO_OPTIONS);
	const [plan, setPlan] = useState("pro");
	const [rangeLoHi, setRangeLoHi] = useState({ min: 20, max: 80 });
	const [time12, setTime12] = useState("14:00");
	const [moneyDemo, setMoneyDemo] = useState("150000");
	const [splitDateIso, setSplitDateIso] = useState("2026-06-15");
	const [switchDemo, setSwitchDemo] = useState(true);
	const [ratingStars, setRatingStars] = useState(3);
	const [tagSkills, setTagSkills] = useState(["react", "typescript"]);
	const [tagLabels, setTagLabels] = useState([]);

	return (
		<Page>
			<Title>Демонстрация полей формы</Title>
			<Lead>
				Компоненты на <code>@emotion/styled</code>: текст, многострочный ввод, число, пароль,
				чекбокс, переключатель, рейтинг (звёзды), радио, диапазон, комбобокс (select / multiselect / chips), дата и время. У полей
				ввода — подпись сверху, «плавающая» подпись или без подписи.
			</Lead>

			<Section>
				<SectionTitle>Текстовое поле</SectionTitle>
				<Grid>
					<TextField placeholder="Без label" helperText="Подсказка под полем" />
					<TextField label="Имя" labelMode="above" placeholder="Иван" helperText="Как в паспорте" />
					<TextField
						label="Email"
						labelMode="floating"
						defaultValue="hello@example.com"
						helperText="Плавающий label при заполненном значении"
					/>
					<TextField label="Компания" labelMode="floating" placeholder="ООО Ромашка" />
					<TextField label="С ошибкой" labelMode="above" error="Обязательное поле" defaultValue="" />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Многострочный ввод</SectionTitle>
				<Grid>
					<TextAreaField
						placeholder="Комментарий без label"
						rows={2}
						helperText="Высота по умолчанию — 3 строки; здесь rows={2}"
					/>
					<TextAreaField
						label="Описание"
						labelMode="above"
						rows={3}
						placeholder="2–3 строки однострочного поля по метрикам шрифта и отступов"
					/>
					<TextAreaField
						label="Заметка"
						labelMode="floating"
						defaultValue="Уже заполнено"
						helperText="Плавающий label"
					/>
					<TextAreaField label="С ошибкой" labelMode="above" error="Обязательное поле" rows={2} />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Чекбокс</SectionTitle>
				<Grid>
					<CheckboxField label="Согласен с условиями" helperText="Подпись справа от квадрата" />
					<CheckboxField label="Рассылка" defaultChecked helperText="По умолчанию включено" />
					<CheckboxField label="Недоступно" disabled helperText="disabled" />
					<CheckboxField label="Ошибка" error="Нужно отметить" />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Переключатель (SwitchButton)</SectionTitle>
				<Grid>
					<SwitchButton label="Уведомления" helperText="Неконтролируемый" />
					<SwitchButton label="Автосохранение" defaultChecked helperText="defaultChecked" />
					<SwitchButton
						label="Контролируемый"
						checked={switchDemo}
						onChange={(e) => setSwitchDemo(e.target.checked)}
						helperText={switchDemo ? "Включено" : "Выключено"}
					/>
					<SwitchButton label="Недоступно" disabled defaultChecked helperText="disabled" />
					<SwitchButton label="С ошибкой" error="Включите опцию" />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Рейтинг (звёзды)</SectionTitle>
				<Grid>
					<Rating
						label="Интерактивно, целые"
						value={ratingStars}
						onChange={setRatingStars}
						helperText={`Текущее значение: ${ratingStars}`}
					/>
					<Rating
						label="Половина звезды"
						precision="half"
						defaultValue={3.5}
						helperText="precision=&quot;half&quot; — клик слева/справа по звезде"
					/>
					<Rating label="Размер sm" size="sm" defaultValue={4} />
					<Rating label="Размер lg" size="lg" defaultValue={2} voteCount={42} />
					<Rating
						label="Только чтение"
						value={3.5}
						precision="half"
						readOnly
						voteCount={12847}
						helperText="readOnly + voteCount"
					/>
					<Rating label="Отключено" value={4} disabled helperText="disabled" />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Радиокнопки</SectionTitle>
				<Grid>
					<RadioGroup
						name="plan-demo"
						label="Тариф"
						labelMode="above"
						options={[
							{ value: "free", label: "Бесплатный" },
							{ value: "pro", label: "Про" },
							{ value: "biz", label: "Бизнес", disabled: true },
						]}
						value={plan}
						onChange={(e) => setPlan(e.target.value)}
						helperText="Контролируемое значение"
					/>
					<RadioGroup
						name="pay-demo"
						labelMode="none"
						options={[
							{ value: "card", label: "Карта" },
							{ value: "invoice", label: "Счёт" },
						]}
						defaultValue="card"
					/>
					<SoloRadioBlock>
						<SoloRadioCaption>Одна радиокнопка (RadioItem)</SoloRadioCaption>
						<RadioItem name="solo-demo" value="only" label="Единственный вариант" defaultChecked />
					</SoloRadioBlock>
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Диапазон (одно значение / интервал)</SectionTitle>
				<Grid>
					<RangeField label="Громкость" labelMode="above" defaultValue={35} min={0} max={100} />
					<RangeField
						label="Баланс"
						labelMode="floating"
						defaultValue={50}
						showValueLabelsBelow
						showBoundsLabels
						formatValueLabel={(n) => `${n}%`}
						helperText="Подписи под дорожкой: границы шкалы и значение"
					/>
					<RangeField
						mode="range"
						label="Цена"
						labelMode="above"
						min={0}
						max={100}
						step={5}
						value={rangeLoHi}
						onRangeChange={setRangeLoHi}
						showBoundsLabels
						formatValueLabel={(n) => `${n} ₽`}
						helperText="Подписи выбранного интервала и границ шкалы"
					/>
					<RangeField mode="range" labelMode="none" min={10} max={90} defaultValue={{ min: 30, max: 70 }} />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Число (max = 100)</SectionTitle>
				<Grid>
					<NumberField placeholder="Без label" max={100} min={0} helperText="0…100" />
					<NumberField label="Процент" labelMode="above" max={100} defaultValue={42} />
					<NumberField label="Баллы" labelMode="floating" max={100} placeholder="0–100" />
					<NumberField
						label="Сумма"
						labelMode="above"
						groupThousands
						thousandsSeparator=" "
						suffix="руб."
						max={99999999}
						value={moneyDemo}
						onChange={(e) => setMoneyDemo(e.target.value)}
						helperText="Группы разрядов пробелом; справа подпись; в форме — без пробелов"
					/>
					<NumberField
						label="Количество"
						labelMode="floating"
						suffix="шт"
						min={0}
						defaultValue={24}
						helperText="Только суффикс, без группировки"
					/>
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Пароль</SectionTitle>
				<Grid>
					<PasswordField placeholder="Секрет" visibilityToggle={false} />
					<PasswordField label="Пароль" labelMode="above" defaultValue="hunter2" />
					<PasswordField label="Ключ" labelMode="floating" placeholder="••••••••" />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Выпадающий список с вводом</SectionTitle>
				<Grid>
					<SelectField options={DEMO_OPTIONS} placeholder="Город (single)" variant="select" />
					<SelectField
						label="Город"
						labelMode="above"
						variant="select"
						options={DEMO_OPTIONS}
						defaultValue="spb"
					/>
					<SelectField
						label="Регионы"
						labelMode="floating"
						variant="multiselect"
						options={DEMO_OPTIONS}
						defaultValue={["msk", "spb", "nsk", "ekb"]}
					/>
					<SelectField
						label="Теги (chips, фикс. высота)"
						labelMode="floating"
						variant="chips"
						options={DEMO_OPTIONS}
						expandable={false}
						defaultValue={["msk", "spb", "nsk", "kzn"]}
					/>
					<SelectField
						label="Теги (chips, expandable)"
						labelMode="floating"
						variant="chips"
						options={DEMO_OPTIONS}
						expandable
						defaultValue={["msk", "spb", "nsk", "ekb", "kzn"]}
					/>
					<SelectField
						label="Без фильтра"
						labelMode="above"
						variant="select"
						options={DEMO_OPTIONS}
						filterable={false}
						defaultValue="ekb"
					/>
					<SelectField
						label="Creatable (одиночный)"
						labelMode="above"
						variant="select"
						options={creatableCityOptions}
						creatable
						placeholder="Выберите или введите новый…"
						helperText="Пункт «Создать…» или Enter; опции дополняются через onCreateOption"
						getNewOptionData={(input) => ({
							value: input.trim().toLowerCase().replace(/\s+/g, "_"),
							label: input.trim(),
						})}
						onCreateOption={(_raw, opt) =>
							setCreatableCityOptions((prev) =>
								prev.some((o) => o.value === opt.value) ? prev : [...prev, opt],
							)
						}
					/>
					<SelectField
						label="Creatable multiselect"
						labelMode="floating"
						variant="multiselect"
						options={creatableCityOptions}
						creatable
						defaultValue={["msk"]}
						getNewOptionData={(input) => ({
							value: input.trim().toLowerCase().replace(/\s+/g, "_"),
							label: input.trim(),
						})}
						onCreateOption={(_raw, opt) =>
							setCreatableCityOptions((prev) =>
								prev.some((o) => o.value === opt.value) ? prev : [...prev, opt],
							)
						}
					/>
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Теги (TagInput)</SectionTitle>
				<Grid>
					<TagInput
						label="Навыки"
						labelMode="above"
						value={tagSkills}
						onChange={(e) => setTagSkills(e.target.value)}
						suggestions={TAG_SUGGEST}
						maxTags={6}
						pattern={/^[a-z0-9][a-z0-9-]{0,30}$/i}
						validateTag={(tag) => (tag.length < 2 ? "Минимум 2 символа" : null)}
						commitSeparators={{ enter: true, comma: true, space: false }}
						helperText={`Сейчас: ${tagSkills.join(", ")}. Enter или запятая; подсказки; max 6; без дубликатов`}
					/>
					<TagInput
						label="Метки"
						labelMode="floating"
						value={tagLabels}
						onChange={(e) => setTagLabels(e.target.value)}
						suggestions={["bug", "feature", "docs", "breaking", "chore"]}
						maxTags={8}
						commitSeparators={{ enter: true, comma: true, space: true }}
						duplicatePolicy="allow"
						helperText="Пробел завершает тег; дубликаты разрешены"
					/>
				</Grid>
			</Section>

			<Section>
				<SectionTitle>OTP (код из цифр)</SectionTitle>
				<Grid>
					<OtpInput
						length={4}
						label="Код из 4 цифр"
						labelMode="above"
						helperText="Цифра вводится в отдельное поле, курсор переходит вперёд; Backspace — назад"
					/>
					<OtpInput length={6} label="Код подтверждения" labelMode="floating" />
					<OtpInput length={4} labelMode="none" helperText="Без label над группой" />
					<OtpInput
						length={4}
						label="Контролируемое значение"
						labelMode="above"
						value={otpCode}
						onChange={(e) => setOtpCode(e.target.value)}
						helperText={otpCode.length ? `Сейчас: ${otpCode}` : "Введите четыре цифры"}
					/>
					<OtpInput length={4} label="С ошибкой" labelMode="above" error="Неверный код" defaultValue="12" />
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Дата и время</SectionTitle>
				<Grid>
					<DateField
						label="Дата встречи"
						labelMode="above"
						helperText="Ввод вручную: ГГГГ-ММ-ДД или ДД.ММ.ГГГГ; Enter или blur — применить"
					/>
					<DateField
						label="Маска ISO"
						labelMode="above"
						dateInputMask="iso"
						defaultValue="2026-06-01"
						helperText="dateInputMask=&quot;iso&quot; — только цифры, разделители «-»"
					/>
					<DateField
						label="Маска ДД.ММ.ГГГГ"
						labelMode="above"
						dateInputMask="dmy_dot"
						min="2026-01-01"
						max="2026-12-31"
						helperText="dateInputMask=&quot;dmy_dot&quot;"
					/>
					<DateField
						label="Маска ДД/ММ/ГГГГ"
						labelMode="floating"
						dateInputMask="dmy_slash"
						helperText="dateInputMask=&quot;dmy_slash&quot;"
					/>
					<DateField
						label="Подсветка в календаре"
						labelMode="above"
						defaultValue="2026-06-15"
						min="2026-01-01"
						max="2026-12-31"
						markedDates={DEMO_MARKED_DATES}
						helperText="markedDates — фон; сегодня — рамка (откройте календарь)"
					/>
					<DateSplitField
						label="Дата (ДД · ММ · ГГГГ)"
						labelMode="above"
						value={splitDateIso}
						onChange={(e) => setSplitDateIso(e.target.value)}
						dateOrder="dmy"
						dateSeparator="."
						min="2026-01-01"
						max="2026-12-31"
						markedDates={DEMO_MARKED_DATES}
						helperText="Три поля + календарь; вставка ГГГГ-ММ-ДД или ДД.ММ.ГГГГ"
					/>
					<DateSplitField
						label="Порядок ГГГГ-ММ-ДД"
						labelMode="floating"
						dateOrder="ymd"
						dateSeparator="-"
						defaultValue="2026-03-20"
						min="2020-01-01"
						max="2030-12-31"
						helperText="dateOrder=&quot;ymd&quot;, dateSeparator=&quot;-&quot;"
					/>
					<DateField label="Срок" labelMode="floating" min="2026-01-01" max="2026-12-31" />
					<TimeField label="Начало" labelMode="above" defaultValue="09:30" />
					<TimeField label="Окончание" labelMode="floating" step={900} helperText="Шаг 15 минут" />
					<TimeField
						label="Время (12 ч)"
						labelMode="above"
						hour12
						value={time12}
						onChange={(e) => setTime12(e.target.value)}
						helperText="Ввод: ЧЧ:ММ, h:mm AM/PM или 13:30; в форме — всегда 24 ч (HH:MM)"
					/>
				</Grid>
			</Section>

			<Section>
				<SectionTitle>Загрузка файлов</SectionTitle>
				<Grid>
					<FileUpload
						label="Изображения (зона + кнопка, onUpload)"
						variant="combined"
						accept="image/*"
						maxFiles={4}
						maxSize={4 * 1024 * 1024}
						helperText="Имитация запроса: прогресс и статус «готово»"
						onUpload={demoFileUpload}
						fullWidth
					/>
					<FileUpload
						label="Любые файлы (только кнопка)"
						variant="button"
						maxFiles={3}
						helperText="Перетаскивание на всю область блока"
						onChange={(files) => {
							if (files.length) console.debug("[FileUpload demo button]", files);
						}}
					/>
					<FileUpload
						label="Только drop-зона"
						variant="dropzone"
						accept=".pdf,application/pdf"
						maxFiles={2}
						maxSize={5 * 1024 * 1024}
					/>
				</Grid>
			</Section>
		</Page>
	);
}
