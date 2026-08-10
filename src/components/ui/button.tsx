'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold transition-all duration-200 ease-smooth disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/70 focus-visible:ring-offset-2 active:translate-y-px select-none',
  {
    variants: {
      variant: {
        cta: 'bg-cta-gradient text-white shadow-cta hover:shadow-[0_14px_34px_rgba(255,106,0,0.45)] hover:brightness-105 cursor-pointer',
        primary:
          'bg-brand-gradient text-white shadow-brand hover:shadow-[0_14px_34px_rgba(10,108,255,0.38)] hover:brightness-105 cursor-pointer',
        outline:
          'border border-brand-200 bg-white text-brand-700 hover:border-brand-400 hover:bg-brand-50 cursor-pointer',
        ghost: 'text-ink-muted hover:bg-slate-100 hover:text-ink cursor-pointer',
        soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100 cursor-pointer',
        dark: 'bg-ink text-white hover:bg-slate-800 cursor-pointer',
        danger: 'bg-state-danger text-white hover:brightness-110 cursor-pointer',
        link: 'text-brand-600 underline-offset-4 hover:underline cursor-pointer',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 text-[0.95rem]',
        lg: 'h-[3.25rem] px-7 text-base',
        xl: 'h-14 px-8 text-lg',
        icon: 'h-10 w-10',
      },
      block: {
        true: 'w-full',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size, block }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';
