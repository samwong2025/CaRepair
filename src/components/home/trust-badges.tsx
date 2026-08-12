'use client';

import {
  BadgeCheck,
  Banknote,
  Lock,
  ShieldCheck,
  Star,
  Timer,
  Video,
  type LucideIcon,
} from 'lucide-react';
import { trustBadges } from '../../config/site';

const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Video,
  BadgeCheck,
  Timer,
  Banknote,
  Lock,
  Star,
};

/** 信任徽章帶 —— 緊接 Hero 之下，強化下單信心 */
export function TrustBadges() {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="section-shell">
        <ul className="grid grid-cols-2 divide-slate-100 md:grid-cols-3 lg:grid-cols-6 lg:divide-x">
          {trustBadges.map((badge) => {
            const Icon = iconMap[badge.icon] ?? ShieldCheck;
            return (
              <li
                key={badge.label}
                className="group flex cursor-default items-center gap-3 px-3 py-5 transition-colors duration-200 hover:bg-brand-50/50 lg:justify-center lg:px-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-gradient group-hover:text-white">
                  <Icon className="h-5 w-5" strokeWidth={2.1} />
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-bold text-ink">{badge.label}</span>
                  <span className="truncate text-[0.7rem] text-ink-faint">{badge.detail}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
