'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const TechWorkbench = dynamic(
  () => import('@/components/admin/tech-workbench').then((m) => m.TechWorkbench),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-ink-muted">
        載入工作台資料中…
      </div>
    ),
  },
);

type DashboardData = {
  currentUser: import('@/lib/auth').CurrentUser | null;
  orders: import('@/types').RepairOrder[];
  inventory: import('@/types').Part[];
  alerts: import('@/types').InventoryAlert[];
  todayProjected: number;
  weekActual: number;
  monthActual: number;
};

function DashboardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-ink-muted">
      載入工作台資料中…
    </div>
  );
}

export default function DashboardClient() {
  const router = useRouter();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;

    const load = () => {
      fetch('/api/admin/dashboard')
        .then(async (res) => {
          if (res.status === 401) {
            // 登入後第一時間 cookie 可能尚未同步，重試一次再判定
            return new Promise<DashboardData>((resolve, reject) => {
              retryTimer = setTimeout(() => {
                fetch('/api/admin/dashboard')
                  .then(async (r2) => {
                    if (r2.status === 401) {
                      router.replace('/admin/login');
                      reject(new Error('UNAUTHORIZED'));
                      return;
                    }
                    if (!r2.ok) {
                      reject(new Error(`HTTP ${r2.status}`));
                      return;
                    }
                    resolve((await r2.json()) as DashboardData);
                  })
                  .catch(reject);
              }, 250);
            });
          }
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return (await res.json()) as DashboardData;
        })
        .then((json) => {
          if (active && json) setData(json);
        })
        .catch((e) => {
          if (active && e?.message !== 'UNAUTHORIZED') {
            setError(e instanceof Error ? e.message : String(e));
          }
        });
    };

    load();
    return () => {
      active = false;
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [router]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        載入後台資料失敗：{error}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="ml-3 rounded-md bg-red-600 px-3 py-1 text-xs font-bold text-white hover:bg-red-700"
        >
          重試
        </button>
      </div>
    );
  }

  if (!data) return <DashboardSkeleton />;

  return (
    <TechWorkbench
      orders={data.orders}
      currentUser={data.currentUser}
      inventory={data.inventory}
      alerts={data.alerts}
      todayProjected={data.todayProjected}
      weekActual={data.weekActual}
      monthActual={data.monthActual}
    />
  );
}
