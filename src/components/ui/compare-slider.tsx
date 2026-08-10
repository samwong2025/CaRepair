'use client';

import * as React from 'react';
import { MoveHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import { SmartImage } from './smart-image';

/**
 * 維修前／後對比滑桿。
 * 支援滑鼠拖曳、觸控拖曳與鍵盤左右鍵操作，右側（後）為底圖，左側（前）以 clip-path 裁切覆蓋。
 */
export function CompareSlider({
  beforeSrc,
  afterSrc,
  beforeLabel = '維修前',
  afterLabel = '維修後',
  alt,
  className,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  alt: string;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(50);
  const [dragging, setDragging] = React.useState(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  React.useEffect(() => {
    if (!dragging) return;

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();
      updateFromClientX(event.clientX);
    };
    const stop = () => setDragging(false);

    window.addEventListener('pointermove', handleMove, { passive: false });
    window.addEventListener('pointerup', stop);
    window.addEventListener('pointercancel', stop);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stop);
      window.removeEventListener('pointercancel', stop);
    };
  }, [dragging, updateFromClientX]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((prev) => Math.max(0, prev - 4));
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((prev) => Math.min(100, prev + 4));
    }
  };

  return (
    <div
      ref={containerRef}
      role="slider"
      tabIndex={0}
      aria-label={`${alt} 維修前後對比`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(position)}
      onPointerDown={(event) => {
        setDragging(true);
        updateFromClientX(event.clientX);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        'group relative isolate cursor-ew-resize select-none overflow-hidden rounded-2xl bg-slate-900 outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand-500',
        className,
      )}
    >
      {/* 底層：維修後 */}
      <SmartImage
        src={afterSrc}
        alt={`${alt}・${afterLabel}`}
        wrapperClassName="absolute inset-0 h-full w-full"
        fallbackText={afterLabel}
        fallbackBg="0A6CFF"
      />

      {/* 上層：維修前（依 position 裁切） */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
        aria-hidden
      >
        <SmartImage
          src={beforeSrc}
          alt={`${alt}・${beforeLabel}`}
          wrapperClassName="absolute inset-0 h-full w-full"
          className="saturate-[0.85]"
          fallbackText={beforeLabel}
          fallbackBg="1E293B"
        />
        <span className="absolute inset-0 bg-gradient-to-r from-slate-900/45 to-transparent" />
      </div>

      {/* 標籤 */}
      <span className="pointer-events-none absolute left-4 top-4 z-20 rounded-full bg-slate-900/70 px-3 py-1 text-[0.7rem] font-bold tracking-wide text-white backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-brand-600/85 px-3 py-1 text-[0.7rem] font-bold tracking-wide text-white backdrop-blur-sm">
        {afterLabel}
      </span>

      {/* 分隔線與拖曳把手 */}
      <div
        className="pointer-events-none absolute inset-y-0 z-20 w-px bg-white/90 shadow-[0_0_16px_rgba(255,255,255,0.65)]"
        style={{ left: `${position}%` }}
      >
        <span
          className={cn(
            'absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-white/95 text-brand-600 shadow-lift transition-transform duration-200',
            dragging ? 'scale-110' : 'group-hover:scale-105',
          )}
        >
          <MoveHorizontal className="h-5 w-5" strokeWidth={2.4} />
        </span>
      </div>

      {/* 高寬比佔位 */}
      <div className="aspect-[4/3] w-full sm:aspect-[16/10]" aria-hidden />
    </div>
  );
}
