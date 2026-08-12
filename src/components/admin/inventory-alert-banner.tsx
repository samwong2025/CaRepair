'use client';

import Link from 'next/link';
import { AlertTriangle, PackageX, PackageSearch } from 'lucide-react';
import type { InventoryAlert, Part } from '../../types';

interface InventoryAlertBannerProps {
  alerts: InventoryAlert[];
  onJumpToInventory?: () => void;
}

/** 庫存警告橫幅：缺貨 / 低庫存 一次提示 */
export function InventoryAlertBanner({ alerts, onJumpToInventory }: InventoryAlertBannerProps) {
  if (!alerts || alerts.length === 0) {
    return (
      <Link
        href="/admin/inventory"
        className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 transition-colors hover:bg-emerald-100"
      >
        <PackageSearch className="h-4 w-4" />
        庫存充足，無缺貨風險（點擊查看庫存）
      </Link>
    );
  }

  const outCount = alerts.filter((a) => a.level === 'out').length;
  const lowCount = alerts.filter((a) => a.level === 'low').length;

  return (
    <Link
      href="/admin/inventory"
      className="block rounded-xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-amber-800">
          <AlertTriangle className="h-4 w-4" />
          庫存警告
          {outCount > 0 && (
            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
              缺貨 {outCount}
            </span>
          )}
          {lowCount > 0 && (
            <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[0.65rem] font-extrabold text-white">
              偏低 {lowCount}
            </span>
          )}
        </div>
        <span className="text-[0.7rem] font-bold text-amber-800 underline-offset-2 hover:underline">
          管理庫存
        </span>
      </div>
      <ul className="mt-2 space-y-1">
        {alerts.slice(0, 6).map((alert) => (
          <li key={alert.part.id} className="flex items-center gap-2 text-xs text-amber-900">
            {alert.level === 'out' ? (
              <PackageX className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
            )}
            <span>{alert.message}</span>
          </li>
        ))}
        {alerts.length > 6 && (
          <li className="text-[0.65rem] text-amber-700">…還有 {alerts.length - 6} 項</li>
        )}
      </ul>
    </Link>
  );
}

/** 單一配件的庫存狀態小標籤（用於選配件時內嵌顯示） */
export function PartStockBadge({ part }: { part: Part }) {
  if (part.stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[0.65rem] font-bold text-red-600">
        <PackageX className="h-3 w-3" /> 缺貨
      </span>
    );
  }
  if (part.stock <= part.lowStockThreshold) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-bold text-amber-600">
        <AlertTriangle className="h-3 w-3" /> 僅 {part.stock}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[0.65rem] font-bold text-emerald-600">
      庫存 {part.stock}
    </span>
  );
}
