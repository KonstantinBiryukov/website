/**
 * Formatting helpers for dates and durations shown in the UI.
 */
import type { YearMonth } from '../data/types';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/** Split "2022-04" into numbers. */
function parts(value: YearMonth): { year: number; month: number } {
  const [year, month] = value.split('-').map(Number);
  return { year: year ?? 0, month: month ?? 1 };
}

/** "2022-04" → "Apr 2022". */
export function formatYearMonth(value: YearMonth): string {
  const { year, month } = parts(value);
  return `${MONTHS[month - 1] ?? ''} ${year}`;
}

/**
 * Inclusive length of a period in whole months, formatted as "1 yr 7 mo".
 * `end === null` means "until now".
 *
 * @param now — injectable for tests.
 */
export function formatDuration(start: YearMonth, end: YearMonth | null, now: Date = new Date()): string {
  const a = parts(start);
  const b = end === null ? { year: now.getFullYear(), month: now.getMonth() + 1 } : parts(end);
  // +1: a role from April to April is one month long, not zero.
  const total = Math.max(1, (b.year - a.year) * 12 + (b.month - a.month) + 1);
  const years = Math.floor(total / 12);
  const months = total % 12;
  const out: string[] = [];
  if (years > 0) out.push(`${years} yr`);
  if (months > 0) out.push(`${months} mo`);
  return out.join(' ');
}
