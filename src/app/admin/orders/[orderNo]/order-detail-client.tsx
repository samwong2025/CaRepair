'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const OrderEditForm = dynamic(() => import('./order-edit-form').then((m) => m.OrderEditForm), {
  ssr: false,
  loading: () => (
    <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-ink-muted">
      載入中…
    </div>
  ),
});

type Props = React.ComponentProps<typeof OrderEditForm>;

export default function OrderDetailClient(props: Props) {
  return <OrderEditForm {...props} />;
}
