import type { Metadata } from 'next';
import { ClipboardCheck, HandHeart, MessageSquareText, ShieldCheck } from 'lucide-react';
import { TrackPanel } from '../../../components/track/track-panel';

export const metadata: Metadata = {
  title: '維修進度追蹤與售後服務｜CathyRepair',
  description:
    '輸入訂單編號或手提號碼，即時查看 iPhone、iPad、Apple Watch、MacBook 維修進度時間軸，並可提交保養期內售後申請。',
  alternates: { canonical: '/track' },
};

const notes = [
  {
    icon: ClipboardCheck,
    title: '27 項出機檢測',
    description: '每張工單完成維修後均通過觸控、鏡頭、訊號、防水等 27 項檢測。',
  },
  {
    icon: ShieldCheck,
    title: '保養期內免費再修',
    description: '同類故障於保養期內復發，免工費免配件費重新處理。',
  },
  {
    icon: MessageSquareText,
    title: '狀態變更即時通知',
    description: '每個階段完成都會 WhatsApp 通知，唔使自己不停 F5。',
  },
  {
    icon: HandHeart,
    title: '十年手作 · Cathy 親手跟進',
    description: '唔做花巧廣告，由下單到取機都由 Cathy 親手跟進，口碑先係長線。',
  },
];

export default function TrackPage({
  searchParams,
}: {
  searchParams?: { q?: string; phone?: string };
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-14 pt-12 sm:pb-16 sm:pt-16">
        <span aria-hidden className="absolute inset-0 bg-grid-slate opacity-[0.16]" />
        <span
          aria-hidden
          className="absolute -right-24 top-0 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl"
        />

        <div className="section-shell relative text-center">
          <span className="eyebrow text-brand-300">Order Tracking</span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            即時追蹤你部機的維修進度
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-white/70">
            由落單、檢測、施工到品檢取機，每個階段都有時間戳與處理人記錄，公開透明。
          </p>

          <ul className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {notes.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-4 text-left backdrop-blur-sm"
                >
                  <Icon className="h-5 w-5 text-brand-300" strokeWidth={2} />
                  <p className="mt-2.5 text-[0.92rem] font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{item.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="bg-surface-muted py-10 sm:py-14">
        <div className="section-shell">
          <TrackPanel initialKeyword={searchParams?.q ?? searchParams?.phone ?? ''} />
        </div>
      </section>
    </>
  );
}
