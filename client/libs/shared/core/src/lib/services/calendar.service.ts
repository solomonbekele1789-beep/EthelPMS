import { Injectable } from '@angular/core';

export interface EthiopianDate {
  year: number;
  month: number; // 1..13
  day: number;   // 1..30 (1..5 or 1..6 for Pagume)
}

export const ETHIOPIAN_MONTHS_EN = [
  'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
  'Megabit', 'Miazia', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagume',
] as const;

export const ETHIOPIAN_MONTHS_AM = [
  'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
  'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን',
] as const;

const JD_EPOCH_OFFSET_AMETE_MIHRET = 1723856;

@Injectable({ providedIn: 'root' })
export class CalendarService {
  /** Convert a Gregorian Date to an Ethiopian date via Julian Day Number. */
  toEthiopian(date: Date): EthiopianDate {
    const jdn = this.gregorianToJdn(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return this.jdnToEthiopian(jdn);
  }

  /** Convert an Ethiopian date to a Gregorian Date (UTC midnight). */
  toGregorian(eth: EthiopianDate): Date {
    const jdn = this.ethiopianToJdn(eth.year, eth.month, eth.day);
    const { year, month, day } = this.jdnToGregorian(jdn);
    return new Date(year, month - 1, day);
  }

  /** Format an Ethiopian date in English or Amharic. */
  formatEthiopian(eth: EthiopianDate, lang: 'en' | 'am' = 'en'): string {
    const months = lang === 'am' ? ETHIOPIAN_MONTHS_AM : ETHIOPIAN_MONTHS_EN;
    const monthName = months[Math.max(0, Math.min(12, eth.month - 1))];
    return `${monthName} ${eth.day}, ${eth.year}`;
  }

  isEthiopianLeapYear(year: number): boolean {
    return (year + 1) % 4 === 0;
  }

  daysInEthiopianMonth(year: number, month: number): number {
    if (month < 13) return 30;
    return this.isEthiopianLeapYear(year) ? 6 : 5;
  }

  private gregorianToJdn(year: number, month: number, day: number): number {
    const a = Math.floor((14 - month) / 12);
    const y = year + 4800 - a;
    const m = month + 12 * a - 3;
    return (
      day +
      Math.floor((153 * m + 2) / 5) +
      365 * y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) -
      32045
    );
  }

  private jdnToGregorian(jdn: number): { year: number; month: number; day: number } {
    const a = jdn + 32044;
    const b = Math.floor((4 * a + 3) / 146097);
    const c = a - Math.floor((146097 * b) / 4);
    const d = Math.floor((4 * c + 3) / 1461);
    const e = c - Math.floor((1461 * d) / 4);
    const m = Math.floor((5 * e + 2) / 153);
    const day = e - Math.floor((153 * m + 2) / 5) + 1;
    const month = m + 3 - 12 * Math.floor(m / 10);
    const year = 100 * b + d - 4800 + Math.floor(m / 10);
    return { year, month, day };
  }

  private ethiopianToJdn(year: number, month: number, day: number): number {
    return (
      JD_EPOCH_OFFSET_AMETE_MIHRET +
      365 +
      365 * (year - 1) +
      Math.floor(year / 4) +
      30 * month +
      day -
      31
    );
  }

  private jdnToEthiopian(jdn: number): EthiopianDate {
    const r = (jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) % 1461;
    const n = (r % 365) + 365 * Math.floor(r / 1460);
    const year =
      4 * Math.floor((jdn - JD_EPOCH_OFFSET_AMETE_MIHRET) / 1461) +
      Math.floor(r / 365) -
      Math.floor(r / 1460);
    const month = Math.floor(n / 30) + 1;
    const day = (n % 30) + 1;
    return { year, month, day };
  }
}
