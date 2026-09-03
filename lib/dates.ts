import { toJalaali } from 'jalaali-js';

const fa = (value: string | number) =>
  String(value).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

const months = [
  'فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
  'مهر','آبان','آذر','دی','بهمن','اسفند'
];

export function jalaliLong(iso?: string | null) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  const j = toJalaali(d.getFullYear(), d.getMonth()+1, d.getDate());
  return `${fa(j.jd)} ${months[j.jm-1]} ${fa(j.jy)}`;
}

export function faNum(n: number | string) {
  return fa(n);
}
