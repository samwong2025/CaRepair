export function AdminPageHeader({
  title,
  titleEn,
  description,
  action,
}: {
  title: string;
  titleEn: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="no-print mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
          {titleEn}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">{title}</h1>
        {description ? <p className="mt-1.5 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {action}
    </header>
  );
}
