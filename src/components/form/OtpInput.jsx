import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import { FieldShell } from "./FieldShell";
import { OtpGroup, OtpDigit } from "./OtpInput.styles";

function digitsFromString(raw, length) {
	const d = String(raw ?? "")
		.replace(/\D/g, "")
		.slice(0, length);
	return Array.from({ length }, (_, i) => d[i] ?? "");
}

function buildSyntheticChange(value, name, id) {
	const target = { value, name, id };
	return { target, currentTarget: target };
}

/**
 * Поле ввода OTP: `length` отдельных ячеек, общий `label` через FieldShell.
 * При вводе цифры фокус переходит на следующую ячейку; Backspace очищает и при пустой ячейке — к предыдущей; стрелки влево/вправо двигают фокус.
 * Paste: вставка ровно `length` цифр заполняет все ячейки.
 *
 * @param {{
 *   id?: string,
 *   name?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   length: number,
 *   value?: string,
 *   defaultValue?: string,
 *   onChange?: (e: { target: { value: string, name?: string, id?: string }, currentTarget: { value: string, name?: string, id?: string } }) => void,
 *   disabled?: boolean,
 *   required?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 * }} props
 */
export function OtpInput({
	id: idProp,
	name,
	label,
	labelMode = "above",
	length,
	value,
	defaultValue,
	onChange,
	disabled,
	required,
	error,
	helperText,
	fullWidth = false,
}) {
	const autoId = useId();
	const id = idProp || autoId;
	const helperId = `${id}-helper`;
	const isControlled = value !== undefined;
	const [localDigits, setLocalDigits] = useState(() =>
		String(defaultValue ?? "")
			.replace(/\D/g, "")
			.slice(0, length),
	);
	const compact = isControlled
		? String(value ?? "")
				.replace(/\D/g, "")
				.slice(0, length)
		: localDigits;

	const cells = useMemo(() => digitsFromString(compact, length), [compact, length]);

	const inputsRef = useRef(/** @type {(HTMLInputElement|null)[]} */ ([]));
	const [focusedIdx, setFocusedIdx] = useState(null);

	const filled = useMemo(() => cells.every((c) => c.length > 0), [cells]);

	const emit = (nextCompact) => {
		if (!isControlled) setLocalDigits(nextCompact);
		onChange?.(buildSyntheticChange(nextCompact, name, id));
	};

	useEffect(() => {
		inputsRef.current = inputsRef.current.slice(0, length);
	}, [length]);

	useEffect(() => {
		if (isControlled) return;
		setLocalDigits((s) => String(s).replace(/\D/g, "").slice(0, length));
	}, [length, isControlled]);

	const focusAt = (i) => {
		requestAnimationFrame(() => {
			const el = inputsRef.current[i];
			if (el) {
				el.focus();
				el.select();
			}
		});
	};

	const applyDigits = (digits, startIndex) => {
		const cur = digitsFromString(compact, length);
		let idx = startIndex;
		for (const ch of digits) {
			if (idx >= length) break;
			if (/\d/.test(ch)) {
				cur[idx] = ch;
				idx += 1;
			}
		}
		const next = cur.join("");
		emit(next);
		const nextFocus = Math.min(idx, length - 1);
		focusAt(nextFocus);
	};

	const handleChange = (i, e) => {
		const v = e.target.value.replace(/\D/g, "");
		if (!v) {
			const cur = digitsFromString(compact, length);
			cur[i] = "";
			emit(cur.join(""));
			return;
		}
		applyDigits(v, i);
	};

	const handleKeyDown = (i, e) => {
		if (e.key === "Backspace") {
			const cur = digitsFromString(compact, length);
			if (cur[i]) {
				cur[i] = "";
				emit(cur.join(""));
			} else if (i > 0) {
				cur[i - 1] = "";
				emit(cur.join(""));
				focusAt(i - 1);
			}
			e.preventDefault();
		}
		if (e.key === "ArrowLeft" && i > 0) {
			e.preventDefault();
			focusAt(i - 1);
		}
		if (e.key === "ArrowRight" && i < length - 1) {
			e.preventDefault();
			focusAt(i + 1);
		}
	};

	const handlePaste = (e) => {
		const text = e.clipboardData.getData("text").replace(/\D/g, "");
		if (text.length !== length) return;
		e.preventDefault();
		emit(text);
		focusAt(length - 1);
	};

	const floating = labelMode === "floating";
	const anyFocused = focusedIdx !== null;
	const showError = Boolean(error);

	const inner = (
		<OtpGroup
			role="group"
			aria-label={!label || labelMode === "none" ? label || "Код подтверждения" : undefined}
			aria-invalid={showError || undefined}
			aria-describedby={helperText || showError ? helperId : undefined}
			onPaste={handlePaste}
		>
			{Array.from({ length }, (_, i) => (
				<OtpDigit
					key={i}
					id={i === 0 ? id : `${id}-${i}`}
					ref={(el) => {
						inputsRef.current[i] = el;
					}}
					inputMode="numeric"
					pattern="[0-9]*"
					autoComplete={i === 0 ? "one-time-code" : "off"}
					maxLength={1}
					disabled={disabled}
					required={required}
					aria-label={label ? `${label}, цифра ${i + 1} из ${length}` : `Цифра ${i + 1}`}
					value={cells[i] || ""}
					onChange={(e) => handleChange(i, e)}
					onKeyDown={(e) => handleKeyDown(i, e)}
					onFocus={() => setFocusedIdx(i)}
					onBlur={() => setFocusedIdx((cur) => (cur === i ? null : cur))}
					$frameless={floating}
					$floating={floating}
					$focused={focusedIdx === i}
					$error={Boolean(error)}
				/>
			))}
		</OtpGroup>
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
			focused={anyFocused}
			attachAriaToChild={false}
		>
			{inner}
		</FieldShell>
	);
}
