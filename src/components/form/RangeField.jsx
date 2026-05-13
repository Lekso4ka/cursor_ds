import React, { useCallback, useId, useMemo, useState } from "react";
import { FieldShell } from "./FieldShell";
import {
	FieldRoot,
	AboveLabel,
	HelperText,
	FloatingFrame,
	FloatingLabel,
} from "./FieldShell.styles";
import { RangeTrackWrap, RangeDualInput, RangeSingleInput, RangeValueRow } from "./RangeField.styles";

function useFilledStateSingle(value, defaultValue) {
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(
		defaultValue === undefined ? 0 : Number(defaultValue),
	);
	const v = isControlled ? Number(value) : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => !Number.isNaN(v), [v]);
	return { value: v, setValue: setV, filled, isControlled };
}

function useFilledStateRange(value, defaultValue, min, max) {
	const isControlled = value !== undefined;
	const defMin = defaultValue?.min ?? min;
	const defMax = defaultValue?.max ?? max;
	const [inner, setInner] = useState({ min: defMin, max: defMax });
	const v = isControlled ? value : inner;
	const setV = isControlled ? () => {} : setInner;
	const filled = useMemo(() => true, []);
	return { value: v, setValue: setV, filled, isControlled };
}

function snap(n, step) {
	if (step === undefined || step === "any" || step <= 0) return n;
	const inv = 1 / step;
	return Math.round(n * inv) / inv;
}

function clamp(n, lo, hi) {
	return Math.min(hi, Math.max(lo, n));
}

/**
 * Ползунок: одно значение (`mode="single"`) или диапазон (`mode="range"`).
 *
 * В режиме диапазона: `value` / `defaultValue` — `{ min, max }`, обновления через `onRangeChange`.
 *
 * @param {{
 *   id?: string,
 *   label?: string,
 *   labelMode?: 'none' | 'above' | 'floating',
 *   mode?: 'single' | 'range',
 *   min?: number,
 *   max?: number,
 *   step?: number,
 *   value?: number | { min: number, max: number },
 *   defaultValue?: number | { min: number, max: number },
 *   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   onRangeChange?: (next: { min: number, max: number }) => void,
 *   name?: string,
 *   disabled?: boolean,
 *   required?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   fullWidth?: boolean,
 *   showValue?: boolean,
 * }} props
 */
export function RangeField({
	id: idProp,
	label,
	labelMode = "above",
	mode = "single",
	min = 0,
	max = 100,
	step = 1,
	value,
	defaultValue,
	onChange,
	onRangeChange,
	name,
	disabled,
	required,
	error,
	helperText,
	fullWidth = false,
	showValue = true,
}) {
	const autoId = useId();
	const id = idProp || autoId;
	const [focused, setFocused] = useState(false);

	if (mode === "single") {
		const { value: v, setValue, filled, isControlled } = useFilledStateSingle(
			typeof value === "number" ? value : undefined,
			typeof defaultValue === "number" ? defaultValue : undefined,
		);
		const floating = labelMode === "floating";

		const handleChange = (e) => {
			const next = snap(Number(e.target.value), step);
			if (!isControlled) setValue(next);
			onChange?.(e);
		};

		const valueHint =
			showValue && !Number.isNaN(v)
				? `Текущее: ${v} (${min}–${max})`
				: showValue && Number.isNaN(v)
					? `Диапазон: ${min}–${max}`
					: "";
		const mergedHelper = [helperText, valueHint].filter(Boolean).join(" · ");

		return (
			<FieldShell
				id={id}
				label={label}
				labelMode={labelMode}
				error={error}
				helperText={mergedHelper || undefined}
				disabled={disabled}
				fullWidth={fullWidth}
				filled={filled}
				focused={focused}
			>
				<RangeSingleInput
					type="range"
					name={name}
					min={min}
					max={max}
					step={step}
					value={isControlled ? v : undefined}
					defaultValue={isControlled ? undefined : v}
					onChange={handleChange}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					disabled={disabled}
					required={required}
					style={floating ? { marginTop: 8 } : undefined}
				/>
			</FieldShell>
		);
	}

	const errorText = typeof error === "string" ? error : error ? "Ошибка" : "";
	const showError = Boolean(error);
	const baseHelper = showError ? errorText : helperText || "";
	const helperId = `${id}-helper`;
	const describedBy = baseHelper ? helperId : undefined;
	const hasLabel = Boolean(label && label.length);

	const { value: rv, setValue: setRange, isControlled: rangeControlled } = useFilledStateRange(
		typeof value === "object" && value !== null && "min" in value ? value : undefined,
		typeof defaultValue === "object" && defaultValue !== null && "min" in defaultValue
			? defaultValue
			: undefined,
		min,
		max,
	);

	const lo = clamp(snap(rv.min, step), min, max);
	const hi = clamp(snap(rv.max, step), min, max);
	const minVal = Math.min(lo, hi);
	const maxVal = Math.max(lo, hi);

	const emitRange = useCallback(
		(next) => {
			onRangeChange?.(next);
		},
		[onRangeChange],
	);

	const handleMinInput = (e) => {
		const raw = snap(Number(e.target.value), step);
		const nextMax = maxVal;
		let nextMin = clamp(raw, min, max);
		if (nextMin > nextMax) nextMin = nextMax;
		const next = { min: nextMin, max: nextMax };
		if (!rangeControlled) setRange(next);
		emitRange(next);
	};

	const handleMaxInput = (e) => {
		const raw = snap(Number(e.target.value), step);
		const nextMin = minVal;
		let nextMax = clamp(raw, min, max);
		if (nextMax < nextMin) nextMax = nextMin;
		const next = { min: nextMin, max: nextMax };
		if (!rangeControlled) setRange(next);
		emitRange(next);
	};

	const mergedRangeHelper = baseHelper;

	const rangeBody = (
		<>
			<RangeTrackWrap>
				<RangeDualInput
					type="range"
					name={name ? `${name}_min` : undefined}
					min={min}
					max={maxVal}
					step={step}
					value={minVal}
					onChange={handleMinInput}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					disabled={disabled}
					$z={1}
				/>
				<RangeDualInput
					type="range"
					name={name ? `${name}_max` : undefined}
					min={minVal}
					max={max}
					step={step}
					value={maxVal}
					onChange={handleMaxInput}
					onFocus={() => setFocused(true)}
					onBlur={() => setFocused(false)}
					disabled={disabled}
					$z={2}
				/>
			</RangeTrackWrap>
			{showValue ? (
				<RangeValueRow>
					<span>{minVal}</span>
					<span>{maxVal}</span>
				</RangeValueRow>
			) : null}
		</>
	);

	if (labelMode === "floating" && hasLabel) {
		const float = focused || true;
		return (
			<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
				<FloatingFrame $error={showError} $focused={focused}>
					<FloatingLabel as="div" $float={float} $focused={focused} $error={showError}>
						{label}
					</FloatingLabel>
					<div style={{ paddingTop: 10 }}>{rangeBody}</div>
				</FloatingFrame>
				<HelperText id={helperId} $error={showError}>
					{mergedRangeHelper}
				</HelperText>
			</FieldRoot>
		);
	}

	if (labelMode === "above" && hasLabel) {
		return (
			<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
				<AboveLabel as="div" $error={showError}>
					{label}
				</AboveLabel>
				<div aria-describedby={describedBy} aria-invalid={showError || undefined}>
					{rangeBody}
				</div>
				<HelperText id={helperId} $error={showError}>
					{mergedRangeHelper}
				</HelperText>
			</FieldRoot>
		);
	}

	return (
		<FieldRoot $disabled={disabled} $fullWidth={fullWidth}>
			<div aria-describedby={describedBy} aria-invalid={showError || undefined}>
				{rangeBody}
			</div>
			<HelperText id={helperId} $error={showError}>
				{mergedRangeHelper}
			</HelperText>
		</FieldRoot>
	);
}
