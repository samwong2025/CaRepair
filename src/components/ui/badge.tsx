import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap',
  {
    variants: {
      variant: {
        brand: 'bg-brand-50 text-brand-700 border border-brand-100',
        accent: 'bg-accent-50 text-accent-700 border border-accent-100',
        success: 'bg-emerald-50 text-emerald-700 border border-emerald-100',
        warning: 'bg-amber-50 text-amber-700 border border-amber-100',
        danger: 'bg-red-50 text-red-700 border border-red-100',
        neutral: 'bg-slate-100 text-ink-muted border border-slate-200',
        solid: 'bg-brand-gradient text-white',
        cta: 'bg-cta-gradient text-white',
      },
      size: {
        sm: 'px-2.5 py-0.5 text-[0.72rem]',
        md: 'px-3 py-1 text-xs',
        lg: 'px-3.5 py-1.5 text-sm',
      },
    },
    defaultVariants: { variant: 'brand', size: 'md' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}
