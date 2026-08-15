import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { cn } from "@/lib/utils";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return reduced;
}

export function FilmStill({
  src,
  alt,
  className,
  children,
  side,
}: {
  src: string;
  alt: string;
  className?: string;
  children?: ReactNode;
  side?: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef(0);
  const pendingRef = useRef<{ x: number; y: number } | null>(null);
  const reduced = usePrefersReducedMotion();
  const [lit, setLit] = useState(false);

  const restLight = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    el.style.setProperty("--lx", `${el.clientWidth * 0.46}px`);
    el.style.setProperty("--ly", `${el.clientHeight * 0.34}px`);
    el.style.setProperty("--lo", "0.28");
  }, []);

  useEffect(() => {
    restLight();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [restLight]);

  const flush = useCallback(() => {
    frameRef.current = 0;
    const el = rootRef.current;
    const next = pendingRef.current;
    if (!el || !next) return;
    el.style.setProperty("--lx", `${next.x}px`);
    el.style.setProperty("--ly", `${next.y}px`);
  }, []);

  const onPointerMove = useCallback(
    (e: PointerEvent<HTMLDivElement>) => {
      if (reduced) return;
      const el = rootRef.current;
      if (!el) return;
      const box = el.getBoundingClientRect();
      pendingRef.current = { x: e.clientX - box.left, y: e.clientY - box.top };
      if (!frameRef.current) frameRef.current = requestAnimationFrame(flush);
      el.style.setProperty("--lo", "0.92");
      if (!lit) setLit(true);
    },
    [flush, lit, reduced],
  );

  const onPointerLeave = useCallback(() => {
    if (reduced) return;
    setLit(false);
    restLight();
  }, [reduced, restLight]);

  return (
    <div
      ref={rootRef}
      className={cn("relative overflow-hidden bg-ink", className)}
      style={{ "--lx": "0px", "--ly": "0px", "--lo": "0" } as CSSProperties}
      onPointerMove={reduced ? undefined : onPointerMove}
      onPointerLeave={reduced ? undefined : onPointerLeave}
      onPointerCancel={reduced ? undefined : onPointerLeave}
    >
      <img
        src={src}
        alt={alt}
        className="kenburns absolute inset-0 h-full w-full object-cover"
      />
      <div className={cn("absolute inset-0", side ? "film-scrim-side" : "film-scrim")} />
      {!reduced && (
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-[5]"
          style={{
            width: "46%",
            height: "58%",
            background:
              "radial-gradient(ellipse at center, rgb(255 248 236 / 0.36) 0%, rgb(126 182 204 / 0.12) 40%, transparent 70%)",
            mixBlendMode: "screen",
            transform: "translate3d(var(--lx), var(--ly), 0) translate(-50%, -50%)",
            opacity: "var(--lo)",
            willChange: "transform, opacity",
            transition: lit
              ? "opacity 220ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "opacity 480ms cubic-bezier(0.22, 1, 0.36, 1), transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

export function PunchStats({
  items,
  invert,
}: {
  items: { k: string; v: string }[];
  invert?: boolean;
}) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px sm:grid-cols-4",
        invert ? "bg-white/15" : "bg-rule",
      )}
    >
      {items.map((it) => (
        <div
          key={it.k}
          className={cn("px-4 py-4 sm:px-5 sm:py-5", invert ? "bg-ink/40" : "bg-paper")}
        >
          <dt className={cn("label-track", invert ? "text-ice" : "text-petrol")}>{it.k}</dt>
          <dd
            className={cn(
              "mt-1 font-serif text-[22px] leading-tight sm:text-[26px]",
              invert ? "text-paper" : "text-ink",
            )}
          >
            {it.v}
          </dd>
        </div>
      ))}
    </dl>
  );
}
