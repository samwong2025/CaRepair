'use client';

import * as React from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
      <p className="font-bold">後台頁面發生錯誤</p>
      <p className="mt-1 break-words text-red-600/80">{error.message || '未知錯誤'}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
      >
        重試
      </button>
    </div>
  );
}
