import { useCallback, useEffect, useRef, type KeyboardEvent, type PointerEvent } from "react";
import '@/styles/coverflow.css'

export type CoverflowItem = {
  src: string;
  alt: string;
  /** Optional label shown under the gallery when this item is focused. */
  title?: string;
  /** Optional link; clicking the focused card opens it. */
  href?: string;
};

export type CoverflowOptions = {
  /** rotateY of side items, in degrees. */
  turn: number;
  /** Spacing between side items, as a fraction of item width. */
  spread: number;
  /** How far side items sit behind the focused one, as a fraction of width. */
  depth: number;
  /** Spacing between the focused item and each neighbour, as a fraction of width. From 1.05 it's a plain slide. */
  centerSpacing: number;
};

export const COVERFLOW_DEFAULTS: CoverflowOptions = {
  turn: 55,
  spread: 0.3,
  depth: 0.5,
  centerSpacing: 0.8,
};

type Props = {
  items: CoverflowItem[];
  options?: Partial<CoverflowOptions>;
  initialIndex?: number;
  /** Card width as a fraction of the stage height. */
  sizeRatio?: number;
  /** Stage height (any CSS length). */
  height?: string;
  onChange?: (index: number) => void;
  className?: string;
};

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export default function Coverflow({
  items,
  options,
  initialIndex,
  sizeRatio = 0.42,
  height = "clamp(300px, 52vw, 460px)",
  onChange,
  className = "",
}: Props) {
  const opts = { ...COVERFLOW_DEFAULTS, ...options };
  const N = items.length;
  const start = clamp(initialIndex ?? Math.floor(N / 2), 0, Math.max(N - 1, 0));

  const stageRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const labelRef = useRef<HTMLSpanElement>(null);

  // Animation state lives in refs: it changes every frame, so it must not trigger React renders.
  const pos = useRef(start);
  const target = useRef(start);
  const width = useRef(200);
  const raf = useRef(0);
  const lastReported = useRef(start);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const render = useCallback(() => {
    const { turn, spread, depth, centerSpacing } = optsRef.current;
    const w = width.current;
    for (let i = 0; i < cardRefs.current.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const p = i - pos.current;
      const a = Math.abs(p);
      const t = Math.min(a, 1);
      const rest = Math.max(a - 1, 0);
      const s = Math.sign(p);
      const x = s * (t * centerSpacing + rest * spread) * w;
      const z = -t * depth * w;
      const ry = -s * t * turn;
      el.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${ry}deg)`;
      el.style.zIndex = String(1000 - Math.round(a * 10));
      el.style.visibility = a > 7 ? "hidden" : "visible";
    }
    const cur = clamp(Math.round(pos.current), 0, N - 1);
    if (labelRef.current) labelRef.current.textContent = `${cur + 1} / ${N}`;
    if (cur !== lastReported.current) {
      lastReported.current = cur;
      onChangeRef.current?.(cur);
    }
  }, [N]);

  const animateTo = useCallback(
    (idx: number) => {
      target.current = clamp(idx, 0, N - 1);
      cancelAnimationFrame(raf.current);
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) {
        pos.current = target.current;
        render();
        return;
      }
      const step = () => {
        pos.current += (target.current - pos.current) * 0.14;
        if (Math.abs(target.current - pos.current) < 0.001) pos.current = target.current;
        render();
        if (pos.current !== target.current) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    [N, render],
  );

  // Size cards from the stage height, and re-render when it changes.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const measure = () => {
      width.current = clamp(stage.clientHeight * sizeRatio, 120, 280);
      stage.style.setProperty("--cf-w", `${width.current}px`);
      render();
    };
    const ro = new ResizeObserver(measure);
    ro.observe(stage);
    measure();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf.current);
    };
  }, [render, sizeRatio]);

  // Re-render when options or items change (e.g. from a settings panel).
  useEffect(() => {
    pos.current = clamp(pos.current, 0, Math.max(N - 1, 0));
    target.current = clamp(target.current, 0, Math.max(N - 1, 0));
    render();
  }, [render, N, opts.turn, opts.spread, opts.depth, opts.centerSpacing]);

  // Horizontal wheel / trackpad. Needs a non-passive listener to call preventDefault.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let timer: number | undefined;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : 0;
      if (!d) return;
      e.preventDefault();
      cancelAnimationFrame(raf.current);
      pos.current = clamp(pos.current + d / (optsRef.current.centerSpacing * width.current), -0.4, N - 0.6);
      render();
      window.clearTimeout(timer);
      timer = window.setTimeout(() => animateTo(Math.round(pos.current)), 120);
    };
    stage.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      stage.removeEventListener("wheel", onWheel);
      window.clearTimeout(timer);
    };
  }, [N, render, animateTo]);

  // Drag with momentum.
  const drag = useRef({ active: false, startX: 0, startPos: 0, lastX: 0, lastT: 0, vel: 0, moved: 0 });

  const perCard = () => Math.max(optsRef.current.centerSpacing, optsRef.current.spread) * width.current;

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button")) return;
    const d = drag.current;
    d.active = true;
    d.moved = 0;
    d.startX = d.lastX = e.clientX;
    d.startPos = pos.current;
    d.lastT = performance.now();
    d.vel = 0;
    cancelAnimationFrame(raf.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add("cf-dragging");
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    const now = performance.now();
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    pos.current = clamp(d.startPos - dx / perCard(), -0.4, N - 0.6);
    d.vel = (e.clientX - d.lastX) / Math.max(now - d.lastT, 1);
    d.lastX = e.clientX;
    d.lastT = now;
    render();
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    e.currentTarget.classList.remove("cf-dragging");
    if (d.moved < 5) {
      // A click, not a drag: focus the card under the pointer, or open its link if it's already focused.
      const hit = document
        .elementsFromPoint(e.clientX, e.clientY)
        .find((n) => (n as HTMLElement).dataset?.cfIndex !== undefined) as HTMLElement | undefined;
      if (hit) {
        const idx = Number(hit.dataset.cfIndex);
        if (idx === Math.round(pos.current) && items[idx]?.href) {
          window.open(items[idx].href, "_blank", "noopener");
        } else {
          animateTo(idx);
        }
        return;
      }
    }
    const fling = -(d.vel * 180) / perCard();
    animateTo(Math.round(pos.current + fling));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") { e.preventDefault(); animateTo(Math.round(target.current) + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); animateTo(Math.round(target.current) - 1); }
    if (e.key === "Home") animateTo(0);
    if (e.key === "End") animateTo(N - 1);
  };

  return (
    <div
      ref={stageRef}
      className={`cf-stage ${className}`}
      style={{ height }}
      tabIndex={0}
      role="region"
      aria-roledescription="carousel"
      aria-label="Gallery"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={onKeyDown}
    >
      <div className="cf-track">
        {items.map((item, i) => (
          <div
            key={item.src + i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="cf-item"
            data-cf-index={i}
            role="group"
            aria-label={`${i + 1} of ${N}: ${item.title ?? item.alt}`}
          >
            <img src={item.src} alt={item.alt} draggable={false} loading={Math.abs(i - start) > 3 ? "lazy" : "eager"} />
          </div>
        ))}
      </div>
      <div className="cf-hud">
        <button type="button" aria-label="Previous" onClick={() => animateTo(Math.round(target.current) - 1)}>‹</button>
        <button type="button" aria-label="Next" onClick={() => animateTo(Math.round(target.current) + 1)}>›</button>
        <span ref={labelRef} aria-live="polite" />
      </div>
    </div>
  );
}