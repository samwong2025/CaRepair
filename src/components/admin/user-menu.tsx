'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, UserRound } from 'lucide-react';
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

  if (!user) return null;

  return (
    <div className="flex items-center gap-2.5">
      <span className="hidden items-center gap-2 sm:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-white">
          <UserRound className="h-4 w-4" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold text-ink">{user.name}</span>
          <span className="block text-[0.68rem] text-ink-faint">{user.email}</span>
        </span>
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
        <span className="hidden sm:inline">登出</span>
      </button>
    </div>
  );
}
