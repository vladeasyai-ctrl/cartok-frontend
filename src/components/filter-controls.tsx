"use client";

import { useLayoutEffect, useRef, useState } from "react";

export const YEAR_MIN = 1990;
export const YEAR_MAX = 2026;
export const MILEAGE_MIN = 0;
export const MILEAGE_MAX = 500_000;
export const MILEAGE_STEP = 5_000;

export function CheckRow({
  checked,
  onChange,
  label,
  compact = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  compact?: boolean;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-2 rounded-2xl bg-zinc-900 ring-1 ${
        checked ? "ring-white/40" : "ring-white/10"
      } ${compact ? "px-2 py-3 text-xs leading-4" : "px-3 py-2.5 text-sm"}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 shrink-0 accent-white"
      />
      <span>{label}</span>
    </label>
  );
}

export function DualRange({
  min,
  max,
  step,
  low,
  high,
  lowLabel,
  highLabel,
  format,
  onLow,
  onHigh,
}: {
  min: number;
  max: number;
  step: number;
  low: number;
  high: number;
  lowLabel: string;
  highLabel: string;
  format: (value: number) => string;
  onLow: (value: number) => void;
  onHigh: (value: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<"low" | "high" | null>(null);
  const latest = useRef({ min, max, step, low, high, onLow, onHigh });
  useLayoutEffect(() => {
    latest.current = { min, max, step, low, high, onLow, onHigh };
  });

  function readValue(clientX: number) {
    const rect = trackRef.current?.getBoundingClientRect();
    const { min: from, max: to, step: gap } = latest.current;
    if (!rect || rect.width === 0) return from;
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    const raw = from + ratio * (to - from);
    const stepped = Math.round((raw - from) / gap) * gap + from;
    return Math.min(to, Math.max(from, stepped));
  }

  function apply(which: "low" | "high", value: number) {
    const current = latest.current;
    if (which === "low") current.onLow(Math.min(value, current.high));
    else current.onHigh(Math.max(value, current.low));
  }

  function begin(which: "low" | "high") {
    function move(event: PointerEvent) {
      apply(which, readValue(event.clientX));
    }
    function up() {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setDrag(null);
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    setDrag(which);
  }

  const span = max - min || 1;
  const lowPct = ((low - min) / span) * 100;
  const highPct = ((high - min) / span) * 100;

  function nudge(which: "low" | "high", direction: number) {
    const current = latest.current;
    const next = (which === "low" ? current.low : current.high) + direction * current.step;
    apply(which, Math.min(current.max, Math.max(current.min, next)));
  }

  function onKey(which: "low" | "high", event: React.KeyboardEvent) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowDown") {
      return;
    }
    event.preventDefault();
    const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
    nudge(which, direction);
  }

  return (
    <div
      ref={trackRef}
      className="relative mx-3 h-8 touch-none"
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).getAttribute("role") === "slider") return;
        const value = readValue(event.clientX);
        const which = Math.abs(value - low) <= Math.abs(value - high) ? "low" : "high";
        apply(which, value);
        begin(which);
      }}
    >
      <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-white/15" />
      <div
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-white"
        style={{ left: `${lowPct}%`, width: `${Math.max(0, highPct - lowPct)}%` }}
      />
      <Thumb
        label={lowLabel}
        percent={lowPct}
        now={low}
        min={min}
        max={high}
        text={format(low)}
        z={drag === "low" || low >= high ? 3 : 2}
        onPointerDown={() => begin("low")}
        onKeyDown={(event) => onKey("low", event)}
      />
      <Thumb
        label={highLabel}
        percent={highPct}
        now={high}
        min={low}
        max={max}
        text={format(high)}
        z={drag === "high" ? 4 : 2}
        onPointerDown={() => begin("high")}
        onKeyDown={(event) => onKey("high", event)}
      />
    </div>
  );
}

function Thumb({
  label,
  percent,
  now,
  min,
  max,
  text,
  z,
  onPointerDown,
  onKeyDown,
}: {
  label: string;
  percent: number;
  now: number;
  min: number;
  max: number;
  text: string;
  z: number;
  onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      role="slider"
      tabIndex={0}
      aria-label={label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={now}
      aria-valuetext={text}
      onPointerDown={onPointerDown}
      onKeyDown={onKeyDown}
      className="absolute top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 cursor-grab rounded-full bg-white shadow active:cursor-grabbing"
      style={{ left: `${percent}%`, zIndex: z }}
    />
  );
}
