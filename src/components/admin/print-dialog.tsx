'use client';

import * as React from 'react';
import { Mail, MessageCircle, Printer, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
  openReceiptEmail,
  openReceiptWhatsapp,
  triggerReceiptPdf,
} from '../../lib/receipt-share';
import type { RepairOrder } from '../../types';

/**
 * 可列印檢視彈窗。
 * 內容以 .print-area 包裹，配合 globals.css 的 @media print 規則，
 * 列印時只輸出標籤／收據，其餘介面（.no-print）自動隱藏。
 */
export function PrintDialog({
  open,
  title,
  description,
  onClose,
  children,
  order,
}: {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** 售後收據用：帶入訂單後，標題列會多出「Email 客戶」「WhatsApp 客戶」電子單按鈕 */
  order?: RepairOrder;
}) {
  React.useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8">
      <div
        className="no-print fixed inset-0 bg-ink/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative z-10 w-full max-w-3xl rounded-2xl bg-white shadow-lift"
      >
        <header className="no-print flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-xs text-ink-muted">{description}</p> : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {order ? (
              <>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => triggerReceiptPdf(order)}
                  title="在新視窗開啟收據，於列印對話框選擇「另存為 PDF」即可下載"
                >
                  <Printer className="h-3.5 w-3.5" />
                  下載 PDF
                </Button>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => openReceiptWhatsapp(order)}
                  title="下載 PDF 並打開 WhatsApp，把 PDF 附件給客戶"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp 客戶
                </Button>
                <Button
                  variant="soft"
                  size="sm"
                  onClick={() => openReceiptEmail(order)}
                  title="下載 PDF 並開啟 Email 草稿，把 PDF 附件給客戶"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email 客戶
                </Button>
              </>
            ) : null}
            <Button variant="primary" size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" />
              列印
            </Button>
            <button
              type="button"
              onClick={onClose}
              aria-label="關閉"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-ink-muted transition-colors duration-200 hover:bg-slate-100 hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="print-area max-h-[75vh] overflow-y-auto bg-surface-soft p-5">{children}</div>
      </div>
    </div>
  );
}
