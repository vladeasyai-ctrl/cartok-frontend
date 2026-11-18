"use client";

import { useEffect, useRef, useState } from "react";

const PHOTO_MS = 3200;
/** Насколько горизонтальный кадр отъезжает от «заполнить экран» к «показать фото целиком». */
const PULL_BACK = 0.8;
const MIN_HEIGHT_RATIO = 0.4;

function fitPhoto(frameW: number, frameH: number, imageW: number, imageH: number) {
  const imageRatio = imageW / imageH;
  const frameRatio = frameW / frameH;
  if (imageRatio <= frameRatio * 1.08) {
    return { width: frameW, height: frameH, inset: false };
  }
  const containH = frameW / imageRatio;
  const pulled = frameH + (containH - frameH) * PULL_BACK;
  const height = Math.min(frameH, Math.max(pulled, frameH * MIN_HEIGHT_RATIO));
  return { width: height * imageRatio, height, inset: true };
}

export function PhotoStack({
  images,
  alt,
  active,
}: {
  images: string[];
  alt: string;
  active: boolean;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState<Record<number, { w: number; h: number }>>({});
  const safeIndex = images.length ? index % images.length : 0;

  function show(next: number) {
    setIndex(next);
  }

  useEffect(() => {
    const element = frameRef.current;
    if (!element) return;
    const apply = () => {
      const w = element.clientWidth;
      const h = element.clientHeight;
      setFrame((prev) => (prev.w === w && prev.h === h ? prev : { w, h }));
    };
    apply();
    const observer = new ResizeObserver(apply);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

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
    <div ref={frameRef} className="absolute inset-0 bg-black">
        {images.map((src, imageIndex) => {
          const known = natural[imageIndex];
          const box = known && frame.w > 0 && frame.h > 0 ? fitPhoto(frame.w, frame.h, known.w, known.h) : null;
          const visible = imageIndex === safeIndex && box;
          return (
            // Обычный img: адреса фото потом придут с произвольного хранилища, а next/image режет неизвестные хосты.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={`${src}-${imageIndex}`}
              src={src}
              alt={imageIndex === safeIndex ? alt : ""}
              draggable={false}
              onLoad={(event) => {
                const img = event.currentTarget;
                if (!img.naturalWidth) return;
                setNatural((prev) => {
                  const size = prev[imageIndex];
                  if (size?.w === img.naturalWidth && size.h === img.naturalHeight) return prev;
                  return { ...prev, [imageIndex]: { w: img.naturalWidth, h: img.naturalHeight } };
                });
              }}
              className={`absolute max-w-none transition-opacity duration-500 ${
                visible ? "opacity-100" : "opacity-0"
              }`}
              style={
                box
                  ? {
                      width: box.width,
                      height: box.height,
                      left: "50%",
                      top: box.inset ? "46%" : "50%",
                      transform: "translate(-50%, -50%)",
                      maskImage: box.inset
                        ? "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)"
                        : undefined,
                      WebkitMaskImage: box.inset
                        ? "linear-gradient(to bottom, transparent 0%, #000 14%, #000 86%, transparent 100%)"
                        : undefined,
                    }
                  : { width: "100%", height: "100%", left: 0, top: 0 }
              }
            />
          );
        })}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[12] h-36 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[12] h-[38%] bg-gradient-to-t from-black/70 via-black/25 to-transparent" />
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
