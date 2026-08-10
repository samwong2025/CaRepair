'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { reviews } from '../../data/content';
import { formatDotDate } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Review } from '../../types';

const AUTOPLAY_MS = 5200;

function usePerView() {
  const [perView, setPerView] = React.useState(1);

  React.useEffect(() => {
    const compute = () => {
      const width = window.innerWidth;
      setPerView(width >= 1024 ? 3 : width >= 640 ? 2 : 1);
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return perView;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`評分 ${rating} 分（滿分 5 分）`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            'h-4 w-4',
            index < rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200',
          )}
        />
      ))}
    </span>
  );
}

function ReviewCard({ review }: { review: Review }) {
  return (
    <article className="glow-card flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1 hover:shadow-lift">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-gradient text-base font-extrabold text-white">
            {review.customerName.slice(0, 1)}
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-[0.95rem] font-bold text-ink">
              {review.customerName}
              {review.repeatCustomer ? (
                <span className="rounded bg-accent-50 px-1.5 py-0.5 text-[0.62rem] font-bold text-accent-600">
                  回頭客
                </span>
              ) : null}
            </p>
            <p className="mt-0.5 text-xs text-ink-faint">{formatDotDate(review.date)}</p>
          </div>
        </div>
        <Quote className="h-7 w-7 shrink-0 text-brand-100" strokeWidth={2.5} />
      </header>

      <Stars rating={review.rating} />

      <p className="mt-3 flex-1 text-[0.93rem] leading-[1.85] text-ink-muted">{review.content}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {review.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-brand-50/70 px-2 py-1 text-[0.7rem] font-semibold text-brand-700"
          >
            {tag}
          </span>
        ))}
      </div>

      <footer className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-xs text-ink-faint">
        <Badge variant="neutral" size="sm">
          {review.deviceModelName}
        </Badge>
        <span aria-hidden>·</span>
        <span className="font-semibold text-ink-muted">{review.symptomSummary}</span>
        <span className="ml-auto">{review.shopName}</span>
      </footer>
    </article>
  );
}

/** 客戶好評輪播：桌面 3 卡／平板 2 卡／手機 1 卡，自動播放並可手動切換 */
export function ReviewsCarousel() {
  const perView = usePerView();
  const [page, setPage] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  const pageCount = Math.max(1, Math.ceil(reviews.length / perView));
  const safePage = Math.min(page, pageCount - 1);

  React.useEffect(() => {
    setPage(0);
  }, [perView]);

  React.useEffect(() => {
    if (paused || pageCount <= 1) return;
    const timer = window.setInterval(() => {
      setPage((prev) => (prev + 1) % pageCount);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [paused, pageCount]);

  const go = (direction: -1 | 1) => {
    setPage((prev) => (prev + direction + pageCount) % pageCount);
  };

  const averageRating = (
    reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <section id="reviews" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            align="left"
            eyebrow="客戶好評"
            title="42,180 位客戶用真實評分投票"
            titleEn="What Customers Say"
            description="以下評價來自維修完成後的匿名回訪，未經篩選、逐條公開。"
          />

          <div className="flex items-center gap-4">
            <div className="rounded-2xl border border-slate-200/80 bg-surface-soft px-5 py-3 text-center">
              <p className="text-2xl font-extrabold leading-none text-ink">{averageRating}</p>
              <div className="mt-1.5 flex justify-center">
                <Stars rating={5} />
              </div>
              <p className="mt-1 text-[0.7rem] text-ink-faint">綜合評分</p>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="上一組評價"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-ink-muted transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="下一組評價"
                className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white text-ink-muted transition-all duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 active:scale-95"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <Reveal className="mt-10">
          <div
            className="overflow-hidden"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={() => setPaused(false)}
          >
            <div
              className="flex transition-transform duration-700 ease-smooth"
              style={{ transform: `translateX(-${safePage * 100}%)` }}
            >
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="shrink-0 px-2.5 pb-3"
                  style={{ width: `${100 / perView}%` }}
                >
                  <ReviewCard review={review} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-6 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setPage(index)}
              aria-label={`跳至第 ${index + 1} 組評價`}
              aria-current={index === safePage}
              className={cn(
                'h-2 cursor-pointer rounded-full transition-all duration-300',
                index === safePage
                  ? 'w-8 bg-brand-gradient'
                  : 'w-2 bg-slate-200 hover:bg-slate-300',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
