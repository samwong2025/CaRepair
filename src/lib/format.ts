/** 金額、日期、單號等展示格式化工具（全站以港幣 HK$ 計價） */

export function formatHKD(amount: number, withDecimals = false): string {
  const value = Number.isFinite(amount) ? amount : 0;
  return `HK$${value.toLocaleString('zh-HK', {
    minimumFractionDigits: withDecimals ? 2 : 0,
    maximumFractionDigits: withDecimals ? 2 : 0,
  })}`;
}

export function formatNumber(value: number): string {
  return (Number.isFinite(value) ? value : 0).toLocaleString('zh-HK');
}

/** 2026.08.10 —— 對標站評價區的日期樣式 */
export function formatDotDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}.${m}.${day}`;
}

/** 2026年8月10日（星期一） */
export function formatFullDate(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${weekdays[d.getDay()]}）`;
}

/** 2026-08-10 14:30 */
export function formatDateTime(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  const pad = (n: number) => `${n}`.padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** 相對時間：3 小時前 / 2 日前 */
export function formatRelative(input: string | Date): string {
  const d = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '—';
  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '剛剛';
  if (minutes < 60) return `${minutes} 分鐘前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} 小時前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} 日前`;
  return formatDotDate(d);
}

/** 電話遮罩：9123 4567 → 9123 ****；姓名遮罩：陳大文 → 陳** */
export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `${digits.slice(0, 4)} ****`;
}

export function maskName(name: string): string {
  if (!name) return '匿名';
  return `${name.slice(0, 1)}**`;
}

/** 電話正規化：移除所有非數字字元，便於比對（9123 4567 → 91234567） */
export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d]/g, '');
}

/** 產生訂單編號：CR-20260810-4F2A */
export function generateOrderNo(prefix = 'CR'): string {
  const d = new Date();
  const pad = (n: number) => `${n}`.padStart(2, '0');
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}-${rand}`;
}

/** 產生會員編號：M-8F31K2 */
export function generateMemberNo(): string {
  return `M-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
