import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import { useAnchorPopoverLayout } from "./useAnchorPopoverLayout";
import {
	TimeRoot,
	TimeHidden,
	TimeInputRow,
	TimeTextInput,
	TimeCalButton,
	TimePop,
	TimeColumns,
	TimeCol,
	TimeColTitle,
	TimeScrollList,
	TimeBtn,
} from "./TimeField.styles";

const CLOCK_HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

function useFilledState(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(defaultValue ?? "");
	const v = isControlled ? value : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => String(v ?? "").length > 0, [v]);
	return { value: v, setValue: setV, filled, isControlled };
}

/**
 * Парсинг значения поля (24h), только ЧЧ:ММ в UI.
 * `ЧЧ:ММ:00` из старых данных принимается, ненулевые секунды — нет.
 */
function parseTime(s) {
	if (!s || typeof s !== "string") return null;
	const m = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(s.trim());
	if (!m) return null;
	const h = Number(m[1]);
	const min = Number(m[2]);
	if (m[3] !== undefined && Number(m[3]) !== 0) return null;
	if (h < 0 || h > 23 || min < 0 || min > 59) return null;
	return { h, m: min };
}

function fmtTime24(p) {
	if (!p) return "";
	return `${String(p.h).padStart(2, "0")}:${String(p.m).padStart(2, "0")}`;
}

function toDaySeconds({ h, m }) {
	return h * 3600 + m * 60;
}

function parseBoundary(s) {
	const p = parseTime(s);
	if (!p) return null;
	return toDaySeconds(p);
}

function twentyFourToClock(h) {
	const meridiem = h < 12 ? "AM" : "PM";
	const clock = h % 12 === 0 ? 12 : h % 12;
	return { clock, meridiem };
}

function clockTo24(clock, meridiem) {
	if (meridiem === "AM") return clock === 12 ? 0 : clock;
	return clock === 12 ? 12 : clock + 12;
}

/** Текст в поле: 24h — ЧЧ:ММ; 12h — h:mm AM/PM. */
function formatForInput(p, hour12) {
	if (!p) return "";
	if (!hour12) return fmtTime24(p);
	const { clock, meridiem } = twentyFourToClock(p.h);
	return `${clock}:${String(p.m).padStart(2, "0")} ${meridiem}`;
}

/**
 * Разбор ввода. В 12h: часы 1–12 с AM/PM; без суффикса — как 24h (0–23), кроме неоднозначности.
 */
function parseTimeFlexible(raw, hour12) {
	const s = raw.trim();
	if (!s) return null;

	const withMer = /^(\d{1,2}):(\d{2})\s*([ap])\s*\.?\s*m?\.?$/i.exec(s);
	if (withMer) {
		const h = Number(withMer[1]);
		const min = Number(withMer[2]);
		const ap = withMer[3].toUpperCase();
		if (min > 59) return null;
		if (hour12) {
			if (h < 1 || h > 12) return null;
			const mer = ap === "A" ? "AM" : "PM";
			return { h: clockTo24(h, mer), m: min };
		}
		if (h < 0 || h > 23) return null;
		return { h, m: min };
	}

	const plain = /^(\d{1,2}):(\d{2})$/.exec(s);
	if (!plain) return null;
	const h = Number(plain[1]);
	const min = Number(plain[2]);
	if (min > 59) return null;

	if (!hour12) {
		if (h < 0 || h > 23) return null;
		return { h, m: min };
	}

	if (h >= 0 && h <= 23) return { h, m: min };
	return null;
}

/** Маска по цифрам: до 4 цифр → вид `h`, `hh`, `h:mm`, `hh:mm`. */
function maskHhmmFromDigits(digits) {
	const d = digits.replace(/\D/g, "").slice(0, 4);
	if (d.length === 0) return "";
	if (d.length <= 2) return d;
	if (d.length === 3) return `${d[0]}:${d.slice(1)}`;
	return `${d.slice(0, 2)}:${d.slice(2, 4)}`;
}

/** Ограничение ввода под `hh:mm`; при hour12 — суффикс AM/PM справа. */
function applyTimeTextMask(raw, hour12) {
	if (!hour12) {
		return maskHhmmFromDigits(raw);
	}
	const s = raw;
	const merIdx = s.search(/[aApP]/);
	if (merIdx === -1) {
		return maskHhmmFromDigits(s);
	}
	const timePart = s.slice(0, merIdx);
	let merPart = s.slice(merIdx).replace(/[^aApP.mM\s.]/g, "");
	merPart = merPart.replace(/\s+/g, " ").trimStart();
	const masked = maskHhmmFromDigits(timePart);
	if (!merPart) return masked;
	return `${masked} ${merPart}`.replace(/\s+/g, " ").trim();
}

function inStepRange(slot, stepSec, minSec, maxSec) {
	const t = toDaySeconds(slot);
	if (t % stepSec !== 0) return false;
	if (minSec != null && t < minSec) return false;
	if (maxSec != null && t > maxSec) return false;
	return true;
}

/**
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
 *   step?: number | string,
 *   hour12?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   popoverMaxVisibleRows?: number,
 *   popoverRowHeightPx?: number,
 *   popoverMaxHeightPx?: number,
 * }} props
 *
 * Ввод по маске `hh:mm` (24h) или `h:mm` + AM/PM при `hour12`. В `onChange` — строка 24h `HH:MM`.
 */
export function TimeField({
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
	step = 60,
	hour12 = false,
	error,
	helperText,
	fullWidth = false,
	popoverMaxVisibleRows = 5,
	popoverRowHeightPx = 44,
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

	const initialV = value !== undefined ? value : (defaultValue ?? "");
	const [text, setText] = useState(() => String(initialV));

	/** Шаг только по целым минутам (секунды в UI не используются). */
	const slotStepSec = useMemo(() => {
		let raw = typeof step === "string" ? Number(step) : Number(step);
		if (!Number.isFinite(raw) || raw <= 0) raw = 60;
		let stepMin = Math.max(1, Math.round(raw / 60));
		let slots = Math.ceil(1440 / stepMin);
		while (slots > 288) {
			stepMin = Math.ceil(stepMin * 1.5);
			slots = Math.ceil(1440 / stepMin);
		}
		return stepMin * 60;
	}, [step]);

	const minSec = useMemo(() => parseBoundary(min), [min]);
	const maxSec = useMemo(() => parseBoundary(max), [max]);

	const { popoverStyle } = useAnchorPopoverLayout(open && !disabled, rootRef, popoverRef, {
		gapPx: 6,
		maxVisibleRows: popoverMaxVisibleRows,
		rowHeightPx: popoverRowHeightPx,
		maxHeightPx: popoverMaxHeightPx,
		contentEstimatePx: hour12 ? 300 : 260,
	});

	const selected = useMemo(() => parseTime(v), [v]);

	const alignedTimes = useMemo(() => {
		const out = [];
		for (let sec = 0; sec < 86400; sec += slotStepSec) {
			if (minSec != null && sec < minSec) continue;
			if (maxSec != null && sec > maxSec) continue;
			const h = Math.floor(sec / 3600);
			const m = Math.floor((sec % 3600) / 60);
			out.push({ h, m });
		}
		return out;
	}, [maxSec, minSec, slotStepSec]);

	const hours24 = useMemo(() => {
		const hs = new Set(alignedTimes.map((t) => t.h));
		if (hs.size === 0) return Array.from({ length: 24 }, (_, i) => i);
		return Array.from(hs).sort((a, b) => a - b);
	}, [alignedTimes]);

	const minutesForHour = (hour24) => alignedTimes.filter((t) => t.h === hour24);

	const [draftHour24, setDraftHour24] = useState(() => selected?.h ?? hours24[0] ?? 0);

	useEffect(() => {
		setText(formatForInput(selected, hour12));
	}, [v, selected, hour12]);

	useEffect(() => {
		if (selected) setDraftHour24(selected.h);
		else if (hours24.length) setDraftHour24(hours24[0]);
	}, [hours24, selected]);

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

	const emit = (slot) => {
		const s = fmtTime24(slot);
		if (!isControlled) setValue(s);
		const target = { value: s, name, id };
		onChange?.({ target, currentTarget: target });
	};

	const tryCommitInput = () => {
		const raw = text.trim();
		if (!raw) {
			if (!isControlled) setValue("");
			onChange?.({ target: { value: "", name, id }, currentTarget: { value: "", name, id } });
			return;
		}
		const parsed = parseTimeFlexible(raw, hour12);
		if (!parsed || !inStepRange(parsed, slotStepSec, minSec, maxSec)) {
			setText(formatForInput(selected, hour12));
			return;
		}
		emit(parsed);
	};

	const { clock: draftClock, meridiem: draftMer } = twentyFourToClock(draftHour24);

	const sameSlot = (a, b) => a && b && a.h === b.h && a.m === b.m;

	const mins = minutesForHour(draftHour24);

	const placeholder = floating
		? undefined
		: hour12
			? "h:mm AM или 13:30"
			: "чч:мм";

	const inner = (
		<TimeRoot ref={rootRef}>
			{name ? (
				<TimeHidden
					type="hidden"
					name={name}
					value={v || ""}
					readOnly
					tabIndex={-1}
					aria-hidden
					required={required}
				/>
			) : null}
			<TimeInputRow>
				<TimeTextInput
					id={id}
					type="text"
					inputMode="text"
					autoComplete="off"
					placeholder={placeholder}
					disabled={disabled}
					required={required}
					aria-haspopup="dialog"
					aria-expanded={open}
					aria-invalid={showError || undefined}
					aria-describedby={describedBy}
					value={text}
					onChange={(e) => setText(applyTimeTextMask(e.target.value, hour12))}
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
				<TimeCalButton
					type="button"
					tabIndex={-1}
					disabled={disabled}
					aria-label="Выбор времени"
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
				</TimeCalButton>
			</TimeInputRow>
			{open && !disabled && (
				<TimePop ref={popoverRef} role="dialog" aria-label="Время" style={popoverStyle}>
					<TimeColumns $hour12={hour12}>
						<TimeCol>
							<TimeColTitle>{hour12 ? "Часы (12 ч)" : "Часы"}</TimeColTitle>
							<TimeScrollList>
								{hour12
									? CLOCK_HOURS.map((c) => (
											<TimeBtn
												key={c}
												type="button"
												$active={draftClock === c}
												onClick={() => setDraftHour24(clockTo24(c, draftMer))}
											>
												{c}
											</TimeBtn>
										))
									: hours24.map((h) => (
											<TimeBtn
												key={h}
												type="button"
												$active={draftHour24 === h}
												onClick={() => setDraftHour24(h)}
											>
												{String(h).padStart(2, "0")}
											</TimeBtn>
										))}
							</TimeScrollList>
						</TimeCol>
						<TimeCol>
							<TimeColTitle>Минуты</TimeColTitle>
							<TimeScrollList>
								{mins.map((slot) => (
									<TimeBtn
										key={`${slot.h}-${slot.m}`}
										type="button"
										$active={sameSlot(selected, slot)}
										onClick={() => {
											emit(slot);
											setOpen(false);
										}}
									>
										{String(slot.m).padStart(2, "0")}
									</TimeBtn>
								))}
							</TimeScrollList>
						</TimeCol>
						{hour12 ? (
							<TimeCol>
								<TimeColTitle> </TimeColTitle>
								<TimeScrollList>
									<TimeBtn
										type="button"
										$active={draftMer === "AM"}
										onClick={() => setDraftHour24(clockTo24(draftClock, "AM"))}
									>
										AM
									</TimeBtn>
									<TimeBtn
										type="button"
										$active={draftMer === "PM"}
										onClick={() => setDraftHour24(clockTo24(draftClock, "PM"))}
									>
										PM
									</TimeBtn>
								</TimeScrollList>
							</TimeCol>
						) : null}
					</TimeColumns>
				</TimePop>
			)}
		</TimeRoot>
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
