/**
 * 以字元碼產生穩定的條碼視覺（純 CSS，不引入額外相依）。
 * 僅作門市內部識別之用，掃描以下方文字編號為準。
 */
export function Barcode({ value, height = 44 }: { value: string; height?: number }) {
  const chars = value.replace(/[^A-Za-z0-9]/g, '').split('');
  const bars = chars.flatMap((char, index) => {
    const code = char.charCodeAt(0) + index;
    return [
      { width: (code % 3) + 1, filled: true },
      { width: (code % 2) + 1, filled: false },
      { width: ((code >> 2) % 3) + 1, filled: true },
      { width: 1, filled: false },
    ];
  });

  return (
    <div>
      <div className="flex items-end gap-px" style={{ height }} aria-hidden>
        {bars.map((bar, index) => (
          <span
            key={index}
            className={bar.filled ? 'bg-slate-900' : 'bg-transparent'}
            style={{ width: bar.width, height: '100%' }}
          />
        ))}
      </div>
      <p className="mt-1 text-center font-mono text-[0.68rem] tracking-[0.28em] text-slate-700">
        {value}
      </p>
    </div>
  );
}
