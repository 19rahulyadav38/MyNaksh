import { formatDayLabel, isSameDay } from '../src/shared/utils/date';

describe('date utils', () => {
  const now = new Date(2026, 9, 13, 15, 0).getTime();

  it('labels today and yesterday', () => {
    expect(formatDayLabel(new Date(2026, 9, 13, 0, 5).getTime(), now)).toBe(
      'Today',
    );
    expect(formatDayLabel(new Date(2026, 9, 12, 23, 59).getTime(), now)).toBe(
      'Yesterday',
    );
  });

  it('formats older dates', () => {
    expect(formatDayLabel(new Date(2026, 9, 1).getTime(), now)).toMatch(/2026/);
  });

  it('compares calendar days, not 24h windows', () => {
    expect(isSameDay(new Date(2026, 9, 12, 23, 59).getTime(), now)).toBe(false);
  });
});
