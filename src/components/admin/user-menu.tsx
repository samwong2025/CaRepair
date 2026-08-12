'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { CurrentUser } from '../../lib/auth';

const ROLE_LABEL: Record<string, string> = {
  admin: '管理員',
  technician: '維修師傅',
};

export function AdminUserMenu({ user }: { user: CurrentUser | null }) {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const logout = async () => {
    setLoading(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  };

  // 未登入 / 取得使用者失敗：仍顯示「登入」入口，避免右上角留白
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/admin/login"
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-muted transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
          aria-label="前往登入"
        >
          <LogIn className="h-3.5 w-3.5" />
          <span>登入</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* 頭像圓圈：行動版始終可見，作為下拉開關；桌面版並排姓名／信箱 */}
      <details className="group relative">
        <summary
          className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-brand-gradient text-white transition-transform duration-200 active:scale-95"
          aria-label="使用者選單"
        >
          <UserRound className="h-4 w-4" />
        </summary>
        <div className="absolute right-0 top-[calc(100%+0.4rem)] z-30 min-w-[12rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <p className="text-sm font-bold text-ink">{user.name}</p>
          <p className="mt-0.5 break-all text-[0.7rem] text-ink-faint">{user.email}</p>
          <div className="mt-2">
            <Badge variant={user.role === 'technician' ? 'warning' : 'brand'} size="sm">
              {ROLE_LABEL[user.role] ?? user.role}
            </Badge>
          </div>
          <button
            type="button"
            onClick={logout}
            disabled={loading}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-muted transition-colors duration-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{loading ? '登出中…' : '登出'}</span>
          </button>
        </div>
      </details>

      {/* 桌面版：展開式資訊（>sm 可見） */}
      <span className="hidden items-center gap-2 sm:flex">
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold text-ink">{user.name}</span>
          <span className="block text-[0.68rem] text-ink-faint">{user.email}</span>
        </span>
        <Badge variant={user.role === 'technician' ? 'warning' : 'brand'} size="sm">
          {ROLE_LABEL[user.role] ?? user.role}
        </Badge>
        <button
          type="button"
          onClick={logout}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-muted transition-colors duration-200 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
          aria-label="登出"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>登出</span>
        </button>
      </span>
    </div>
  );
}