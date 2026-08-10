import * as React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const fieldBase =
  'w-full rounded-xl border border-slate-200 bg-white px-4 text-[0.95rem] text-ink shadow-inset outline-none transition-all duration-200 placeholder:text-ink-faint hover:border-slate-300 focus:border-brand-400 focus:ring-4 focus:ring-brand-500/12 disabled:cursor-not-allowed disabled:bg-slate-50';

const fieldInvalid =
  'border-state-danger/60 focus:border-state-danger focus:ring-state-danger/12 hover:border-state-danger';

/** 表單控件共用的驗證狀態屬性 */
export interface FieldStateProps {
  /** 為 true 時套用錯誤樣式並設定 aria-invalid */
  invalid?: boolean;
}

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & FieldStateProps
>(({ className, invalid, ...props }, ref) => (
  <input
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(fieldBase, 'h-12', invalid && fieldInvalid, className)}
    {...props}
  />
));
Input.displayName = 'Input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldStateProps
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      fieldBase,
      'min-h-[110px] py-3 leading-relaxed',
      invalid && fieldInvalid,
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & FieldStateProps
>(({ className, invalid, ...props }, ref) => (
  <select
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      fieldBase,
      'h-12 cursor-pointer appearance-none pr-10',
      invalid && fieldInvalid,
      className,
    )}
    {...props}
  />
));
Select.displayName = 'Select';

export function Label({
  className,
  required,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }) {
  return (
    <label className={cn('mb-2 block text-sm font-semibold text-ink', className)} {...props}>
      {children}
      {required ? <span className="ml-1 text-state-danger">*</span> : null}
    </label>
  );
}

export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-state-danger">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {children}
    </p>
  );
}
