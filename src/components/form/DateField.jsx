import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import { useAnchorPopoverLayout } from "./useAnchorPopoverLayout";
import {
	DateRoot,
	DateHidden,
	DateInputRow,
	DateTextInput,
	DateCalButton,
	DatePop,
	DateNav,
	DateNavBtn,
	DateMonthTitle,
	DateTodayBtn,
	DateWeekdayRow,
	DateWeekday,
	DateGrid,
	DateDayBtn,
} from "./DateField.styles";

function useFilledState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(defaultValue ?? "");
	const v = isControlled ? value : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => String(v ?? "").length > 0, [v]);
	return { value: v, setValue: setV, filled, isControlled };
}

function validateYmd(y, mo, d) {
	if (!y || mo < 1 || mo > 12 || d < 1 || d > 31) return null;
	const dt = new Date(y, mo - 1, d);
	if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
	return dt;
}

function parseIsoDate(s) {
	if (!s || typeof s !== "string") return null;
	const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s.trim());
	if (!m) return null;
	return validateYmd(Number(m[1]), Number(m[2]), Number(m[3]));
}

/** ISO или ДД.ММ.ГГГГ / ДД/ММ/ГГГГ (разделитель . или /). */
function parseFlexibleDate(s) {
	const t = s.trim();
	if (!t) return null;
	let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
	if (m) return validateYmd(Number(m[1]), Number(m[2]), Number(m[3]));
	m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(t);
	if (m) return validateYmd(Number(m[3]), Number(m[2]), Number(m[1]));
	return null;
}

function fmtIso(d) {
	const y = d.getFullYear();
	const mo = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${mo}-${day}`;
}

/** @typedef {'none' | 'iso' | 'dmy_dot' | 'dmy_slash'} DateInputMask */

function isoToMaskedDisplay(iso, mask) {
	if (!iso || mask === "none") return String(iso ?? "");
	const d = parseIsoDate(iso);
	if (!d) return "";
	const y = d.getFullYear();
	const mo = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	if (mask === "iso") return `${y}-${mo}-${day}`;
	if (mask === "dmy_dot") return `${day}.${mo}.${y}`;
	if (mask === "dmy_slash") return `${day}/${mo}/${y}`;
	return String(iso);
}

function maskPlaceholder(mask, floating) {
	if (floating) return undefined;
	if (mask === "iso") return "ГГГГ-ММ-ДД";
	if (mask === "dmy_dot") return "ДД.ММ.ГГГГ";
	if (mask === "dmy_slash") return "ДД/ММ/ГГГГ";
	return "ГГГГ-ММ-ДД или ДД.ММ.ГГГГ";
}

function digitsOnly(s) {
	return String(s ?? "").replace(/\D/g, "");
}

function formatMaskFromDigits(mask, digits) {
	const d = digits.slice(0, 8);
	if (mask === "iso") {
		let out = d.slice(0, 4);
		if (d.length > 4) out += `-${d.slice(4, 6)}`;
		if (d.length > 6) out += `-${d.slice(6, 8)}`;
		return out;
	}
	if (mask === "dmy_dot") {
		let out = d.slice(0, 2);
		if (d.length > 2) out += `.${d.slice(2, 4)}`;
		if (d.length > 4) out += `.${d.slice(4, 8)}`;
		return out;
	}
	if (mask === "dmy_slash") {
		let out = d.slice(0, 2);
		if (d.length > 2) out += `/${d.slice(2, 4)}`;
		if (d.length > 4) out += `/${d.slice(4, 8)}`;
		return out;
	}
	return d;
}

function parseMaskedIsoDisplay(s) {
	const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s ?? "").trim());
	if (!m) return null;
	return validateYmd(Number(m[1]), Number(m[2]), Number(m[3]));
}

function parseDmyMasked(s, sep) {
	const esc = sep === "." ? "\\." : "\\/";
	const re = new RegExp(`^(\\d{2})${esc}(\\d{2})${esc}(\\d{4})$`);
	const m = re.exec(String(s ?? "").trim());
	if (!m) return null;
	const day = Number(m[1]);
	const mo = Number(m[2]);
	const y = Number(m[3]);
	return validateYmd(y, mo, day);
}

function startOfMonth(d) {
	return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d, n) {
	return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

function buildMonthCells(viewMonth) {
	const first = startOfMonth(viewMonth);
	const mon = first.getMonth();
	const year = first.getFullYear();
	const leadDays = (first.getDay() + 6) % 7;
	let day = 1 - leadDays;
	const cells = [];
	for (let i = 0; i < 42; i += 1) {
		const dt = new Date(year, mon, day);
		cells.push({ date: dt, inMonth: dt.getMonth() === mon });
		day += 1;
	}
	return cells;
}

function sameCalendarDay(a, b) {
	return (
		a.getFullYear() === b.getFullYear() &&
		a.getMonth() === b.getMonth() &&
		a.getDate() === b.getDate()
	);
}

const MONTH_NAMES = [
	"Январь",
	"Февраль",
	"Март",
	"Апрель",
	"Май",
	"Июнь",
	"Июль",
	"Август",
	"Сентябрь",
	"Октябрь",
	"Ноябрь",
	"Декабрь",
];

const WEEKDAYS_MON = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

/**
 * Дата: текстовый ввод + календарь. Значение формы — `YYYY-MM-DD`.
 * Маска ввода задаётся через `dateInputMask` (`none` — как раньше, ISO или ДД.ММ.ГГГГ; `iso` — ГГГГ-ММ-ДД;
 * `dmy_dot` / `dmy_slash` — день-месяц-год с разделителем).
 *
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   name?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   min?: string,
 *   max?: string,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   dateInputMask?: DateInputMask,
 *   popoverMaxVisibleRows?: number,
 *   popoverRowHeightPx?: number,
 *   popoverMaxHeightPx?: number,
 * }} props
 */
export function DateField({
	id: idProp,
	label,
	labelMode = "above",
	value,
	defaultValue,
	onChange,
	name,
	disabled,
	required,
	min,
	max,
	error,
	helperText,
	fullWidth = false,
	dateInputMask = "none",
	popoverMaxVisibleRows = 5,
	popoverRowHeightPx = 52,
	popoverMaxHeightPx,
}) {
	const autoId = useId();
	const id = idProp || autoId;
	const helperId = `${id}-helper`;
	const [focused, setFocused] = useState(false);
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);
	const popoverRef = useRef(null);
	const { value: v, setValue, filled, isControlled } = useFilledState(value, defaultValue);
	const [text, setText] = useState(() =>
		isoToMaskedDisplay(value !== undefined ? value : (defaultValue ?? ""), dateInputMask),
	);

	const minD = useMemo(() => parseIsoDate(min), [min]);
	const maxD = useMemo(() => parseIsoDate(max), [max]);

	const selected = useMemo(() => parseIsoDate(v), [v]);

	const [view, setView] = useState(() => startOfMonth(selected || new Date()));

	const { popoverStyle } = useAnchorPopoverLayout(open && !disabled, rootRef, popoverRef, {
		gapPx: 6,
		maxVisibleRows: popoverMaxVisibleRows,
		rowHeightPx: popoverRowHeightPx,
		maxHeightPx: popoverMaxHeightPx,
		contentEstimatePx: 320,
	});

	useEffect(() => {
		setText(isoToMaskedDisplay(v ?? "", dateInputMask));
	}, [v, dateInputMask]);

	useEffect(() => {
		if (selected) setView(startOfMonth(selected));
	}, [selected]);

	useEffect(() => {
		if (!open) return;
		const onDoc = (e) => {
			if (!rootRef.current?.contains(e.target)) setOpen(false);
		};
		document.addEventListener("mousedown", onDoc);
		return () => document.removeEventListener("mousedown", onDoc);
	}, [open]);

	useEffect(() => {
		if (!open) return;
		const onKey = (e) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("keydown", onKey);
		return () => document.removeEventListener("keydown", onKey);
	}, [open]);

	const floating = labelMode === "floating";

	const showError = Boolean(error);
	const helper =
		(typeof error === "string" ? error : error ? "Ошибка" : "") ||
		helperText ||
		"";
	const describedBy = helper ? helperId : undefined;

	const atMidnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

	const inRange = (d) => {
		const t = atMidnight(d);
		if (minD && t < atMidnight(minD)) return false;
		if (maxD && t > atMidnight(maxD)) return false;
		return true;
	};

	const emit = (iso) => {
		if (!isControlled) setValue(iso);
		const target = { value: iso, name, id };
		onChange?.({ target, currentTarget: target });
	};

	const tryCommitInput = () => {
		const raw = text.trim();
		if (!raw) {
			emit("");
			return;
		}
		let parsed = null;
		if (dateInputMask === "none") {
			parsed = parseFlexibleDate(raw);
		} else if (dateInputMask === "iso") {
			parsed = parseMaskedIsoDisplay(raw);
		} else if (dateInputMask === "dmy_dot") {
			parsed = parseDmyMasked(raw, ".");
		} else if (dateInputMask === "dmy_slash") {
			parsed = parseDmyMasked(raw, "/");
		}
		if (!parsed || !inRange(parsed)) {
			setText(isoToMaskedDisplay(v ?? "", dateInputMask));
			return;
		}
		emit(fmtIso(parsed));
	};

	const cells = useMemo(() => buildMonthCells(view), [view]);

	const canPrev =
		!minD || addMonths(view, -1).getTime() >= startOfMonth(minD).getTime();
	const canNext =
		!maxD || startOfMonth(addMonths(view, 1)).getTime() <= startOfMonth(maxD).getTime();

	const today = new Date();
	const todayOk = inRange(today);

	const inner = (
		<DateRoot ref={rootRef}>
			{name ? (
				<DateHidden
					type="hidden"
					name={name}
					value={v || ""}
					readOnly
					tabIndex={-1}
					aria-hidden
					required={required}
				/>
			) : null}
			<DateInputRow>
				<DateTextInput
					id={id}
					type="text"
					inputMode="numeric"
					autoComplete="off"
					placeholder={maskPlaceholder(dateInputMask, floating)}
					disabled={disabled}
					required={required}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-invalid={showError || undefined}
					aria-describedby={describedBy}
					value={text}
					onChange={(e) => {
						if (dateInputMask === "none") {
							setText(e.target.value);
							return;
						}
						const t = e.target.value.trim();
						const flex = t ? parseFlexibleDate(t) : null;
						if (flex) {
							setText(isoToMaskedDisplay(fmtIso(flex), dateInputMask));
							return;
						}
						setText(formatMaskFromDigits(dateInputMask, digitsOnly(e.target.value)));
					}}
					onFocus={() => setFocused(true)}
					onBlur={() => {
						tryCommitInput();
						setFocused(false);
					}}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							e.preventDefault();
							tryCommitInput();
						}
					}}
					$frameless={floating}
					$floating={floating}
					$focused={focused || open}
					$error={showError}
				/>
				<DateCalButton
					type="button"
					tabIndex={-1}
					disabled={disabled}
					aria-label="Открыть календарь"
					$frameless={floating}
					$floating={floating}
					$focused={focused || open}
					$error={showError}
					onMouseDown={(e) => {
						e.preventDefault();
						if (!disabled) setOpen((o) => !o);
					}}
				>
					▾
				</DateCalButton>
			</DateInputRow>
			{open && !disabled && (
				<DatePop ref={popoverRef} role="dialog" aria-label="Календарь" style={popoverStyle}>
					<DateNav>
						<DateNavBtn type="button" disabled={!canPrev} onClick={() => setView((x) => addMonths(x, -1))}>
							‹
						</DateNavBtn>
						<DateMonthTitle>
							{MONTH_NAMES[view.getMonth()]} {view.getFullYear()}
						</DateMonthTitle>
						<DateNavBtn type="button" disabled={!canNext} onClick={() => setView((x) => addMonths(x, 1))}>
							›
						</DateNavBtn>
					</DateNav>
					<DateWeekdayRow>
						{WEEKDAYS_MON.map((w) => (
							<DateWeekday key={w}>{w}</DateWeekday>
						))}
					</DateWeekdayRow>
					<DateGrid>
						{cells.map(({ date, inMonth }, idx) => {
							const iso = fmtIso(date);
							const ok = inRange(date);
							const isSel = selected && fmtIso(selected) === iso;
							const isToday = sameCalendarDay(date, today);
							return (
								<DateDayBtn
									key={idx}
									type="button"
									$outside={!inMonth}
									$selected={isSel}
									$today={isToday}
									disabled={!ok}
									onClick={() => {
										if (!ok) return;
										emit(iso);
										setOpen(false);
									}}
								>
									{date.getDate()}
								</DateDayBtn>
							);
						})}
					</DateGrid>
					<DateTodayBtn
						type="button"
						disabled={!todayOk}
						onClick={() => {
							if (!todayOk) return;
							emit(fmtIso(today));
							setOpen(false);
						}}
					>
						Сегодня
					</DateTodayBtn>
				</DatePop>
			)}
		</DateRoot>
	);

	return (
		<FieldShell
			id={id}
			label={label}
			labelMode={labelMode}
			error={error}
			helperText={helperText}
			disabled={disabled}
			fullWidth={fullWidth}
			filled={filled}
			focused={focused || open}
			attachAriaToChild={false}
		>
			{inner}
		</FieldShell>
	);
}
