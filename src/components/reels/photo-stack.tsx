"use client";

import { useEffect, useState } from "react";

const PHOTO_MS = 3200;

export function PhotoStack({
  images,
  alt,
  active,
}: {
  images: string[];
  alt: string;
  active: boolean;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const safeIndex = images.length ? index % images.length : 0;

  function show(next: number) {
    setIndex(next);
  }

  useEffect(() => {
    if (!paused) return;
    function release() {
      setPaused(false);
    }
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [paused]);

  useEffect(() => {
    if (!active || paused || images.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => {
      setIndex((index + 1) % images.length);
    }, PHOTO_MS);
    return () => window.clearTimeout(timer);
  }, [active, paused, images.length, index]);

  function step(delta: number) {
    if (images.length < 2) return;
    show((safeIndex + delta + images.length) % images.length);
  }

  function onPointerDown() {
    setPaused(true);
  }

  function onPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    const down = event.currentTarget.dataset;
    const startX = Number(down.x);
    const startY = Number(down.y);
    const moved = Math.hypot(event.clientX - startX, event.clientY - startY);
    setPaused(false);
    if (!Number.isFinite(startX) || moved > 16) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    if (x < rect.width * 0.35) step(-1);
    else if (x > rect.width * 0.65) step(1);
  }

  const canAnimate = active && images.length > 1;

  return (
    <div className="absolute inset-0 bg-zinc-900">
        {images.map((src, imageIndex) => (
          // Обычный img: адреса фото потом придут с произвольного хранилища, а next/image режет неизвестные хосты.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={`${src}-${imageIndex}`}
            src={src}
            alt={imageIndex === safeIndex ? alt : ""}
            draggable={false}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
              imageIndex === safeIndex ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
      <div
        className="absolute inset-0 z-10"
        data-x="0"
        data-y="0"
        onPointerDown={(event) => {
          event.currentTarget.dataset.x = String(event.clientX);
          event.currentTarget.dataset.y = String(event.clientY);
          onPointerDown();
        }}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setPaused(false)}
      />
      <div className="pointer-events-none absolute inset-x-0 top-14 z-20 flex gap-1 px-3 pt-[max(0px,env(safe-area-inset-top))]">
        {images.map((_, imageIndex) => (
          <div key={imageIndex} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              key={`${imageIndex}-${imageIndex === safeIndex ? "run" : "idle"}`}
              className="reel-progress-bar h-full origin-left bg-white"
              style={{
                transform: imageIndex < safeIndex || !canAnimate ? "scaleX(1)" : "scaleX(0)",
                animationName:
                  imageIndex === safeIndex && canAnimate && !paused ? "reel-progress" : "none",
                animationDuration: `${PHOTO_MS}ms`,
                animationTimingFunction: "linear",
                animationFillMode: "forwards",
              }}
            />
          </div>
        ))}
      </div>
      {images.length > 1 ? (
        <p className="pointer-events-none absolute top-20 right-3 z-20 text-xs text-white/80">
          {safeIndex + 1} / {images.length}
        </p>
      ) : null}
    </div>
  );
}
