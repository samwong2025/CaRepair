'use client';

import * as React from 'react';

/** 進入視窗後數字遞增動畫（資料看板用） */
export function CountUp({
  end,
  duration = 1600,
  decimals = 0,
  separator = true,
  className,
}: {
  end: number;
  duration?: number;
  decimals?: number;
  separator?: boolean;
  className?: string;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const [value, setValue] = React.useState(0);
  const started = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;

      const reduced =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        setValue(end);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutExpo，數字先快後慢，更有衝擊力
        const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        setValue(end * eased);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') {
      run();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            run();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.35 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  const display = separator
    ? value.toLocaleString('zh-HK', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })
    : value.toFixed(decimals);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
