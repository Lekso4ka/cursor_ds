import { useLayoutEffect, useMemo, useState } from "react";

const DEFAULT_GAP = 6;
const DEFAULT_ROW_H = 40;
const DEFAULT_MAX_ROWS = 5;

/**
 * Вертикальное позиционирование выпадающей панели относительно viewport:
 * при нехватке места снизу — над якорем, иначе под якорем.
 * maxHeight ограничивается числом строк × rowHeight и свободным местом по вертикали.
 *
 * @param {boolean} open
 * @param {React.RefObject<HTMLElement | null>} anchorRef — контейнер с `position: relative` (корень поля)
 * @param {React.RefObject<HTMLElement | null>} popoverRef — панель с `position: absolute`
 * @param {{
 *   gapPx?: number,
 *   maxVisibleRows?: number,
 *   rowHeightPx?: number,
 *   maxHeightPx?: number,
 *   contentEstimatePx?: number,
 *   zIndex?: number,
 * }} [opts]
 */
export function useAnchorPopoverLayout(open, anchorRef, popoverRef, opts = {}) {
	const gapPx = opts.gapPx ?? DEFAULT_GAP;
	const maxVisibleRows = opts.maxVisibleRows ?? DEFAULT_MAX_ROWS;
	const rowHeightPx = opts.rowHeightPx ?? DEFAULT_ROW_H;
	const maxHeightPx = opts.maxHeightPx;
	const contentEstimatePx = opts.contentEstimatePx;
	const zIndex = opts.zIndex ?? 40;

	const rowCap =
		maxHeightPx != null
			? Math.min(maxVisibleRows * rowHeightPx, maxHeightPx)
			: maxVisibleRows * rowHeightPx;

	const [state, setState] = useState({
		placement: "below",
		maxHeight: rowCap,
	});

	useLayoutEffect(() => {
		if (!open) return;

		const measure = () => {
			const anchor = anchorRef.current;
			if (!anchor) return;

			const rect = anchor.getBoundingClientRect();
			const vv = window.visualViewport;
			const vTop = vv?.offsetTop ?? 0;
			const vh = vv?.height ?? window.innerHeight;
			const spaceBelow = vh - (rect.bottom - vTop) - gapPx;
			const spaceAbove = rect.top - vTop - gapPx;

			const pop = popoverRef.current;
			let natural =
				pop?.scrollHeight ??
				contentEstimatePx ??
				Math.min(rowCap, maxVisibleRows * rowHeightPx);
			natural = Math.min(natural, rowCap);
			const need = Math.max(rowHeightPx, natural);

			let placement = "below";
			const fitsBelow = spaceBelow >= need;
			const fitsAbove = spaceAbove >= need;
			if (!fitsBelow && fitsAbove) placement = "above";
			else if (!fitsBelow && !fitsAbove && spaceAbove > spaceBelow) placement = "above";

			const avail = placement === "below" ? spaceBelow : spaceAbove;
			const maxH = Math.min(need, rowCap, Math.max(rowHeightPx * 2 + gapPx, avail));

			setState({ placement, maxHeight: maxH });
		};

		let raf = 0;
		const schedule = () => {
			cancelAnimationFrame(raf);
			raf = requestAnimationFrame(() => {
				raf = requestAnimationFrame(measure);
			});
		};

		schedule();

		window.addEventListener("resize", schedule);
		window.visualViewport?.addEventListener?.("resize", schedule);
		document.addEventListener("scroll", schedule, true);
		const ro = new ResizeObserver(schedule);
		const anchorEl = anchorRef.current;
		if (anchorEl) ro.observe(anchorEl);
		if (popoverRef.current) ro.observe(popoverRef.current);

		return () => {
			cancelAnimationFrame(raf);
			window.removeEventListener("resize", schedule);
			window.visualViewport?.removeEventListener?.("resize", schedule);
			document.removeEventListener("scroll", schedule, true);
			ro.disconnect();
		};
	}, [open, anchorRef, popoverRef, gapPx, maxVisibleRows, rowHeightPx, maxHeightPx, rowCap, contentEstimatePx]);

	const popoverStyle = useMemo(() => {
		if (!open) return undefined;
		return {
			position: "absolute",
			left: 0,
			right: 0,
			zIndex,
			...(state.placement === "below"
				? { top: `calc(100% + ${gapPx}px)`, bottom: "auto" }
				: { bottom: `calc(100% + ${gapPx}px)`, top: "auto" }),
			maxHeight: state.maxHeight,
			overflowY: "auto",
		};
	}, [open, gapPx, state.placement, state.maxHeight, zIndex]);

	return { popoverStyle, placement: state.placement, maxHeight: state.maxHeight };
}
