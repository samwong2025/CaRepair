'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, Lock, Wrench } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@cathyrepair.com');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? '登入失敗');
        setLoading(false);
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setError('網絡錯誤，請重試');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-soft px-4">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 shadow-card">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
            <Wrench className="h-7 w-7" strokeWidth={2.2} />
          </span>
          <h1 className="mt-4 text-xl font-extrabold text-ink">CathyRepair 後台</h1>
          <p className="mt-1 text-sm text-ink-muted">請登入以管理維修訂單</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">帳號（電郵）</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@cathyrepair.com"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">密碼</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="請輸入密碼"
                className="pl-10"
                required
              />
            </div>
          </div>

          {error ? (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-sm text-rose-600">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          ) : null}

          <Button type="submit" variant="cta" size="lg" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            登入
          </Button>
        </form>

        <p className="mt-5 text-center text-[0.7rem] text-ink-faint">
          凱西維修 · 僅限授權人員使用
        </p>
      </div>
    </div>
  );
}
