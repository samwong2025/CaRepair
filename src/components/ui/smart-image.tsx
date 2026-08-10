'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * 具備載入骨架與失敗回退的圖片元件。
 * 遠端圖片無法載入時，自動改用同尺寸的佔位圖，避免版面破損。
 */
export function SmartImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackText,
  fallbackBg = '0A6CFF',
}: {
  src: string;
  alt: string;
  className?: string;
  wrapperClassName?: string;
  fallbackText?: string;
  fallbackBg?: string;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  const fallbackSrc = `https://placehold.co/800x600/${fallbackBg}/FFFFFF?text=${encodeURIComponent(
    fallbackText ?? alt,
  )}`;

  return (
    <span className={cn('relative block overflow-hidden bg-slate-100', wrapperClassName)}>
      {!loaded ? (
        <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={failed ? fallbackSrc : src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setFailed(true);
          setLoaded(true);
        }}
        className={cn(
          'h-full w-full object-cover transition-opacity duration-500',
          loaded ? 'opacity-100' : 'opacity-0',
          className,
        )}
      />
    </span>
  );
}
