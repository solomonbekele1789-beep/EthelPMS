import { CalendarService } from './calendar.service';

describe('CalendarService', () => {
  const service = new CalendarService();

  it('converts Ethiopian New Year (Meskerem 1, 2019 EC) to September 11, 2026 GC', () => {
    const greg = service.toGregorian({ year: 2019, month: 1, day: 1 });
    expect(greg.getFullYear()).toBe(2026);
    expect(greg.getMonth()).toBe(8); // September (0-indexed)
    expect(greg.getDate()).toBe(11);
  });

  it('round-trips Gregorian -> Ethiopian -> Gregorian accurately', () => {
    const original = new Date(2026, 10, 20); // Nov 20, 2026
    const eth = service.toEthiopian(original);
    const back = service.toGregorian(eth);
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(10);
    expect(back.getDate()).toBe(20);
  });

  it('formats Ethiopian dates in English and Amharic', () => {
    expect(service.formatEthiopian({ year: 2019, month: 1, day: 1 }, 'en')).toBe('Meskerem 1, 2019');
    expect(service.formatEthiopian({ year: 2019, month: 1, day: 1 }, 'am')).toBe('መስከረም 1, 2019');
  });
});
