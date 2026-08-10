import * as React from 'react';
import { cn } from '../../lib/utils';

export function Section({
  className,
  children,
  id,
  tone = 'muted',
}: {
  className?: string;
  children: React.ReactNode;
  id?: string;
  tone?: 'muted' | 'white' | 'soft' | 'dark';
}) {
  const toneClass = {
    muted: 'bg-surface-muted',
    white: 'bg-white',
    soft: 'bg-surface-soft',
    dark: 'bg-ink text-white',
  }[tone];

  return (
    <section id={id} className={cn('scroll-mt-24 py-16 sm:py-20 lg:py-24', toneClass, className)}>
      <div className="section-shell">{children}</div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  titleEn,
  description,
  align = 'center',
  invert = false,
  className,
}: {
  eyebrow?: string;
  title: string;
  titleEn?: string;
  description?: string;
  align?: 'center' | 'left';
  invert?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3',
        align === 'center' ? 'items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            'eyebrow',
            invert && 'border-white/20 bg-white/10 text-brand-100',
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
          {eyebrow}
        </span>
      ) : null}
      <h2 className={cn('text-headline', invert && 'text-white')}>{title}</h2>
      {titleEn ? (
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.35em]',
            invert ? 'text-white/40' : 'text-ink-faint',
          )}
        >
          {titleEn}
        </p>
      ) : null}
      {description ? (
        <p
          className={cn(
            'max-w-2xl text-body',
            invert ? 'text-white/70' : 'text-ink-muted',
            align === 'center' && 'mx-auto',
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
