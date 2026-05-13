import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import { useAnchorPopoverLayout } from "./useAnchorPopoverLayout";
import {
	DateHidden,
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
import {
	DateSplitRoot,
	DateSplitInputRow,
	DatePartInput,
	DateSplitSep,
} from "./DateSplitField.styles";

/** @typedef {'dmy' | 'ymd' | 'mdy'} DateSplitOrder */

const ORDER = /** @type {const} */ ({
	dmy: [0, 1, 2],
	ymd: [2, 1, 0],
	mdy: [1, 0, 2],
});

const PART_ARIA = ["День", "Месяц", "Год"];
const PART_MAX = [2, 2, 4];

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

function fmtIso(d) {
	const y = d.getFullYear();
	const mo = String(d.getMonth() + 1).padStart(2, "0");
	const day = String(d.getDate()).padStart(2, "0");
	return `${y}-${mo}-${day}`;
}

function parseFlexibleDate(s) {
	const t = s.trim();
	if (!t) return null;
	let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(t);
	if (m) return validateYmd(Number(m[1]), Number(m[2]), Number(m[3]));
	m = /^(\d{1,2})[./](\d{1,2})[./](\d{4})$/.exec(t);
	if (m) return validateYmd(Number(m[3]), Number(m[2]), Number(m[1]));
	return null;
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

function markedIsoSetFromProp(markedDates) {
	if (!Array.isArray(markedDates)) return new Set();
	const s = new Set();
	for (const raw of markedDates) {
		const d = parseIsoDate(String(raw ?? "").trim());
		if (d) s.add(fmtIso(d));
	}
	return s;
}

function isoToParts(iso) {
	const d = parseIsoDate(iso);
	if (!d) return { dd: "", mm: "", yyyy: "" };
	return {
		dd: String(d.getDate()).padStart(2, "0"),
		mm: String(d.getMonth() + 1).padStart(2, "0"),
		yyyy: String(d.getFullYear()),
	};
}

function getPart(parts, idx) {
	if (idx === 0) return parts.dd;
	if (idx === 1) return parts.mm;
	return parts.yyyy;
}

function setPart(parts, idx, val) {
	if (idx === 0) return { ...parts, dd: val };
	if (idx === 1) return { ...parts, mm: val };
	return { ...parts, yyyy: val };
}

function tryDateFromParts(parts) {
	if (parts.dd.length !== 2 || parts.mm.length !== 2 || parts.yyyy.length !== 4) return null;
	return validateYmd(Number(parts.yyyy), Number(parts.mm), Number(parts.dd));
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
 * Дата: три поля (день / месяц / год) как у OTP по UX + календарь. Значение — `YYYY-MM-DD`.
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
 *   dateOrder?: DateSplitOrder,
 *   dateSeparator?: '.' | '/' | '-',
 *   markedDates?: string[],
 *   popoverMaxVisibleRows?: number,
 *   popoverRowHeightPx?: number,
 *   popoverMaxHeightPx?: number,
 * }} props
 */
export function DateSplitField({
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
	dateOrder = "dmy",
	dateSeparator = ".",
	markedDates,
	popoverMaxVisibleRows = 5,
	popoverRowHeightPx = 52,
	popoverMaxHeightPx,
}) {
	const autoId = useId();
	const fieldId = idProp || autoId;
	const helperId = `${fieldId}-helper`;
	const [focused, setFocused] = useState(false);
	const [open, setOpen] = useState(false);
	const rootRef = useRef(null);
	const inputRowRef = useRef(null);
	const popoverRef = useRef(null);
	const partRefs = useRef(/** @type {(HTMLInputElement|null)[]} */ ([null, null, null]));

	const { value: v, setValue, filled, isControlled } = useFilledState(value, defaultValue);
	const [parts, setParts] = useState(() =>
		isoToParts(value !== undefined ? value : (defaultValue ?? "")),
	);
	const partsRef = useRef(parts);
	partsRef.current = parts;

	const displayOrder = ORDER[dateOrder] ?? ORDER.dmy;

	const minD = useMemo(() => parseIsoDate(min), [min]);
	const maxD = useMemo(() => parseIsoDate(max), [max]);
	const selected = useMemo(() => parseIsoDate(v), [v]);
	const markedIsoSet = useMemo(() => markedIsoSetFromProp(markedDates), [markedDates]);
	const [view, setView] = useState(() => startOfMonth(selected || new Date()));

	const { popoverStyle } = useAnchorPopoverLayout(open && !disabled, rootRef, popoverRef, {
		gapPx: 6,
		maxVisibleRows: popoverMaxVisibleRows,
		rowHeightPx: popoverRowHeightPx,
		maxHeightPx: popoverMaxHeightPx,
		contentEstimatePx: 320,
	});

	useEffect(() => {
		setParts(isoToParts(v ?? ""));
	}, [v]);

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

	const inRange = useCallback(
		(d) => {
			const t = atMidnight(d);
			if (minD && t < atMidnight(minD)) return false;
			if (maxD && t > atMidnight(maxD)) return false;
			return true;
		},
		[minD, maxD],
	);

	const emit = useCallback(
		(iso) => {
			if (!isControlled) setValue(iso);
			const target = { value: iso, name, id: fieldId };
			onChange?.({ target, currentTarget: target });
		},
		[isControlled, setValue, onChange, name, fieldId],
	);

	const focusPart = useCallback((partIdx) => {
		requestAnimationFrame(() => {
			const el = partRefs.current[partIdx];
			if (el) {
				el.focus();
				el.select();
			}
		});
	}, []);

	const focusNext = useCallback(
		(currentPartIdx) => {
			const pos = displayOrder.indexOf(currentPartIdx);
			if (pos < 0 || pos >= displayOrder.length - 1) return;
			focusPart(displayOrder[pos + 1]);
		},
		[displayOrder, focusPart],
	);

	const focusPrev = useCallback(
		(currentPartIdx) => {
			const pos = displayOrder.indexOf(currentPartIdx);
			if (pos <= 0) return;
			focusPart(displayOrder[pos - 1]);
		},
		[displayOrder, focusPart],
	);

	const tryEmitComplete = useCallback(
		(p) => {
			const dt = tryDateFromParts(p);
			if (!dt || !inRange(dt)) return false;
			emit(fmtIso(dt));
			return true;
		},
		[emit, inRange],
	);

	const handlePartChange = (partIdx, e) => {
		const digits = e.target.value.replace(/\D/g, "");
		const maxLen = PART_MAX[partIdx];
		const nextVal = digits.slice(0, maxLen);
		setParts((prev) => {
			const nextParts = setPart(prev, partIdx, nextVal);
			if (nextVal.length === maxLen) {
				requestAnimationFrame(() => {
					if (!tryEmitComplete(nextParts)) focusNext(partIdx);
				});
			}
			return nextParts;
		});
	};

	const handlePartKeyDown = (partIdx, e) => {
		if (e.key === "Backspace") {
			const cur = getPart(parts, partIdx);
			if (!cur) {
				focusPrev(partIdx);
				e.preventDefault();
			}
		}
		if (e.key === "ArrowLeft") {
			const pos = displayOrder.indexOf(partIdx);
			if (pos > 0) {
				e.preventDefault();
				focusPart(displayOrder[pos - 1]);
			}
		}
		if (e.key === "ArrowRight") {
			const pos = displayOrder.indexOf(partIdx);
			if (pos < displayOrder.length - 1) {
				e.preventDefault();
				focusPart(displayOrder[pos + 1]);
			}
		}
	};

	const handlePartBlur = useCallback(
		(e) => {
			const next = e.relatedTarget;
			if (next instanceof Node) {
				if (inputRowRef.current?.contains(next)) return;
				if (popoverRef.current?.contains(next)) return;
			}
			setFocused(false);
			const cur = partsRef.current;
			if (!cur.dd && !cur.mm && !cur.yyyy) {
				emit("");
				return;
			}
			const dt = tryDateFromParts(cur);
			if (dt && inRange(dt)) emit(fmtIso(dt));
			else setParts(isoToParts(v ?? ""));
		},
		[emit, inRange, v],
	);

	const handlePasteAny = (e) => {
		const text = e.clipboardData.getData("text");
		const parsed = parseFlexibleDate(text);
		if (!parsed) return;
		e.preventDefault();
		if (!inRange(parsed)) return;
		emit(fmtIso(parsed));
	};

	const cells = useMemo(() => buildMonthCells(view), [view]);
	const canPrev = !minD || addMonths(view, -1).getTime() >= startOfMonth(minD).getTime();
	const canNext = !maxD || startOfMonth(addMonths(view, 1)).getTime() <= startOfMonth(maxD).getTime();
	const today = new Date();
	const todayOk = inRange(today);

	const inner = (
		<DateSplitRoot ref={rootRef}>
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
			<DateSplitInputRow ref={inputRowRef}>
				{displayOrder.map((partIdx, i) => (
					<React.Fragment key={partIdx}>
						{i > 0 ? <DateSplitSep>{dateSeparator}</DateSplitSep> : null}
						<DatePartInput
							ref={(el) => {
								partRefs.current[partIdx] = el;
							}}
							id={i === 0 ? fieldId : `${fieldId}-${partIdx}`}
							type="text"
							inputMode="numeric"
							autoComplete="off"
							maxLength={PART_MAX[partIdx]}
							disabled={disabled}
							aria-label={PART_ARIA[partIdx]}
							aria-invalid={showError || undefined}
							aria-describedby={i === 0 ? describedBy : undefined}
							aria-haspopup={i === 0 ? "dialog" : undefined}
							aria-expanded={i === 0 ? open : undefined}
							value={getPart(parts, partIdx)}
							onChange={(e) => handlePartChange(partIdx, e)}
							onKeyDown={(e) => handlePartKeyDown(partIdx, e)}
							onPaste={handlePasteAny}
							onFocus={() => setFocused(true)}
							onBlur={handlePartBlur}
							$wide={partIdx === 2}
							$frameless={floating}
							$floating={floating}
							$focused={focused || open}
							$error={showError}
						/>
					</React.Fragment>
				))}
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
			</DateSplitInputRow>
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
							const isMarked = markedIsoSet.has(iso);
							return (
								<DateDayBtn
									key={idx}
									type="button"
									$outside={!inMonth}
									$selected={isSel}
									$today={isToday}
									$marked={isMarked}
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
		</DateSplitRoot>
	);

	return (
		<FieldShell
			id={fieldId}
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
