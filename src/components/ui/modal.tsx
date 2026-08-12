'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ModalSize = 'sm' | 'md' | 'lg';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: ModalSize;
  /** 当 open=true 时禁用外部点击关闭（用于必须确认的危险操作） */
  disableBackdropClose?: boolean;
}

const SIZE_MAP: Record<ModalSize, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * 简易 Modal：白色卡片居中、深色 backdrop、ESC 与点遮罩可关闭。
 * 用法：
 *   <Modal open={x} onClose={() => setX(false)} title="…" footer={…}>
 *     <p>…</p>
 *   </Modal>
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  disableBackdropClose,
}: ModalProps) {
  // ESC 关闭
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !disableBackdropClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose, disableBackdropClose]);

  // 打开时锁定背景滚动
  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* backdrop */}
      <div
        aria-hidden
        onClick={() => !disableBackdropClose && onClose()}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
      />
      {/* card */}
      <div
        className={cn(
          'relative z-10 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl',
          SIZE_MAP[size],
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-base font-extrabold text-ink">{title}</h2>
            {description ? (
              <p className="mt-1 text-xs text-ink-muted">{description}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-5 py-4">
          {children}
        </div>
        {footer ? (
          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 bg-surface-soft px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
