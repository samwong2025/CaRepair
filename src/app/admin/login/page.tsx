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
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.message ?? '登入失敗');
        setLoading(false);
        return;
      }
      // 硬跳以避免 RSC 緩存導致登入後又被踢回登入頁
      window.location.assign('/admin');
    } catch (err) {
      const aborted = err instanceof DOMException && err.name === 'AbortError';
      setError(aborted ? '登入逾時（12 秒），請稍後重試' : '網絡錯誤，請重試');
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

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-[0.7rem] leading-relaxed text-ink-muted">
          <p className="mb-1 font-semibold text-ink-faint">演示帳號</p>
          <p>管理員：admin@cathyrepair.com（密碼見 .env.local 的 ADMIN_PASSWORD）</p>
          <p>維修師傅 陳強：qiang@cathyrepair.com ／ qiang123</p>
          <p>維修師傅 林家明：jiaming@cathyrepair.com ／ jiaming123</p>
        </div>

        <p className="mt-5 text-center text-[0.7rem] text-ink-faint">
          凱西維修 · 僅限授權人員使用
        </p>
      </div>
    </div>
  );
}
