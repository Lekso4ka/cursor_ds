import React, { useId, useMemo, useState } from "react";
import {
	RatingRoot,
	RatingLabel,
	StarsRow,
	StarSlot,
	StarHit,
	StarHitRight,
	StarSvgWrap,
	VoteCount,
	HelperLine,
} from "./Rating.styles";

const STAR_PATH =
	"M12 2.2l2.62 6.42 6.78.52-5.15 4.3 1.58 6.58L12 16.9l-5.83 3.12 1.58-6.58-5.15-4.3 6.78-.52L12 2.2z";

const SIZES = { sm: 22, md: 28, lg: 36 };
const STAR_GAPS = { sm: 4, md: 6, lg: 8 };
const VOTE_FONT = { sm: 12, md: 13, lg: 14 };

function clampRating(n, precision) {
	if (Number.isNaN(n) || n < 0) return 0;
	if (n > 5) return 5;
	if (precision !== "half") return Math.round(n);
	return Math.round(n * 2) / 2;
}

function fillForStar(starIndex1, value, precision) {
	const v = clampRating(Number(value) || 0, precision);
	if (v >= starIndex1) return 1;
	if (precision === "half" && v >= starIndex1 - 0.5) return 0.5;
	return 0;
}

/**
 * Одна звезда: серая база + заливка акцентом (целиком или левая половина).
 */
function StarGlyph({ size, fill, clipId }) {
	const stroke = "rgba(255,255,255,0.28)";
	const empty = "rgba(255,255,255,0.12)";
	const full = "rgba(125, 211, 252, 0.95)";

	return (
		<svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
			<defs>
				{fill === 0.5 && clipId ? (
					<clipPath id={clipId}>
						<rect x="0" y="0" width="12" height="24" />
					</clipPath>
				) : null}
			</defs>
			<path d={STAR_PATH} fill={empty} stroke={stroke} strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
			{fill >= 1 ? (
				<path d={STAR_PATH} fill={full} stroke="rgba(125,211,252,0.35)" strokeWidth="0.4" />
			) : null}
			{fill === 0.5 && clipId ? (
				<path
					d={STAR_PATH}
					fill={full}
					stroke="rgba(125,211,252,0.35)"
					strokeWidth="0.4"
					clipPath={`url(#${clipId})`}
				/>
			) : null}
		</svg>
	);
}

/**
 * Оценка звёздами от 0 до 5 (0 — не выбрано). Шаг 1 или 0.5 через `precision`.
 *
 * @param {{
 *   id?: string,
 *   label?: string,
 *   value?: number,
 *   defaultValue?: number,
 *   onChange?: (value: number) => void,
 *   precision?: 'full' | 'half',
 *   size?: 'sm' | 'md' | 'lg',
 *   voteCount?: number,
 *   readOnly?: boolean,
 *   disabled?: boolean,
 *   error?: string | boolean,
 *   helperText?: string,
 *   preserveHelperSpace?: boolean,
 *   'aria-label'?: string,
 * }} props
 */
export function Rating({
	id: idProp,
	label,
	value,
	defaultValue = 0,
	onChange,
	precision = "full",
	size = "md",
	voteCount,
	readOnly = false,
	disabled = false,
	error,
	helperText,
	preserveHelperSpace = true,
	"aria-label": ariaLabelProp,
}) {
	const autoId = useId();
	const baseId = `r${(idProp || autoId).replace(/:/g, "")}`;
	const isControlled = value !== undefined;
	const [inner, setInner] = useState(() => clampRating(Number(defaultValue) || 0, precision));

	const current = clampRating(
		isControlled ? Number(value) || 0 : inner,
		precision,
	);

	const px = SIZES[size] ?? SIZES.md;
	const starGap = STAR_GAPS[size] ?? STAR_GAPS.md;
	const voteFs = VOTE_FONT[size] ?? VOTE_FONT.md;

	const showError = Boolean(error);
	const errText = typeof error === "string" ? error : error ? "Ошибка" : "";
	const helperLine = showError ? errText : helperText || "";

	const emit = (next) => {
		const v = clampRating(next, precision);
		if (!isControlled) setInner(v);
		onChange?.(v);
	};

	const stars = useMemo(() => [1, 2, 3, 4, 5], []);

	const interactiveLabel =
		ariaLabelProp ||
		(current === 0 ? "Оценка, не выбрано" : `Оценка ${current} из 5`);

	const readonlyImgLabel =
		ariaLabelProp ||
		[
			label,
			`${current} из 5`,
			voteCount != null ? `${voteCount.toLocaleString("ru-RU")} голосов` : null,
		]
			.filter(Boolean)
			.join(". ");

	return (
		<RatingRoot
			role={readOnly ? "img" : "group"}
			aria-label={readOnly ? readonlyImgLabel : label ? undefined : interactiveLabel}
			aria-labelledby={!readOnly && label ? `${baseId}-rating-label` : undefined}
			$gap={label ? 4 : undefined}
			$disabled={disabled}
		>
			{label ? (
				<RatingLabel id={`${baseId}-rating-label`} aria-hidden={readOnly || undefined}>
					{label}
				</RatingLabel>
			) : null}
			<StarsRow $starGap={starGap}>
				{stars.map((i) => {
					const fill = fillForStar(i, current, precision);
					const clipId = `${baseId}-clip-${i}`;
					return (
						<StarSlot key={i} $size={px}>
							{!readOnly && !disabled ? (
								precision === "half" ? (
									<>
										<StarHit
											type="button"
											disabled={disabled}
											aria-label={`${i - 0.5} из 5`}
											onClick={() => emit(i - 0.5)}
										/>
										<StarHitRight
											type="button"
											disabled={disabled}
											aria-label={`${i} из 5`}
											onClick={() => emit(i)}
										/>
									</>
								) : (
									<StarHit
										type="button"
										$full
										disabled={disabled}
										aria-label={`${i} из 5`}
										onClick={() => emit(i)}
									/>
								)
							) : null}
							<StarSvgWrap>
								<StarGlyph size={px} fill={fill} clipId={fill === 0.5 ? clipId : null} />
							</StarSvgWrap>
						</StarSlot>
					);
				})}
				{voteCount != null ? (
					<VoteCount
						$fontSize={voteFs}
						aria-hidden={readOnly || undefined}
						aria-label={!readOnly ? `Число голосов: ${voteCount.toLocaleString("ru-RU")}` : undefined}
					>
						{" "}
						· {voteCount.toLocaleString("ru-RU")}
					</VoteCount>
				) : null}
			</StarsRow>
			{helperLine || preserveHelperSpace ? (
				<HelperLine $error={showError} $preserve={preserveHelperSpace}>
					{helperLine}
				</HelperLine>
			) : null}
		</RatingRoot>
	);
}
