import type { Metadata } from 'next';
import { Clock3, ShieldCheck, Sparkles } from 'lucide-react';
import { RepairWizard } from '../../../components/repair/wizard';
import { deviceGroups } from '../../../data/devices';
import type { DeviceCategory } from '../../../types';

export const metadata: Metadata = {
  title: '網上維修報價落單｜CathyRepair',
  description:
    '四步驟完成 iPhone、iPad、Apple Watch、MacBook 維修落單：揀機型、揀故障、即時睇報價明細（配件費 + 人工費），再約時間到店或安排順豐寄修。',
  alternates: { canonical: '/repair' },
};

const highlights = [
  { icon: Clock3, title: '最快 30 分鐘取機', description: '常見故障門市即場快修，等埋都得。' },
  { icon: ShieldCheck, title: '最長 365 日保養', description: '質保期內同類故障免費再修，安心無憂。' },
  { icon: Sparkles, title: '網上落單即減 HK$50', description: '同時修兩項或以上，另有套餐折扣。' },
];

export default function RepairPage({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const requested = searchParams?.category;
  const initialCategory = deviceGroups.some((group) => group.id === requested)
    ? (requested as DeviceCategory)
    : undefined;

  return (
    <>
      <section className="relative overflow-hidden bg-ink pb-16 pt-12 sm:pb-20 sm:pt-16">
        <span aria-hidden className="absolute inset-0 bg-grid-slate opacity-[0.16]" />
        <span
          aria-hidden
          className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl"
        />
        <span
          aria-hidden
          className="absolute -right-16 bottom-0 h-64 w-64 rounded-full bg-accent-500/20 blur-3xl"
        />

        <div className="section-shell relative text-center">
          <span className="eyebrow text-brand-300">Online Booking</span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">
            90 秒完成落單，即刻知價
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-[0.95rem] leading-relaxed text-white/70 sm:text-base">
            揀機型 → 揀故障 → 睇報價 → 約時間，四步搞掂。提交後自動為你開立會員檔案，
            全程可於網站即時追蹤維修進度。
          </p>

          <ul className="mx-auto mt-9 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => {
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
          <RepairWizard initialCategory={initialCategory} />
        </div>
      </section>
    </>
  );
}
