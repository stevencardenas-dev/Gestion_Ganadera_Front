import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductionChartData } from './useProductionChartData';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Set the fake system date to the given year/month/day.
 * @param {number} year
 * @param {number} month - 0-based (0 = Jan)
 * @param {number} day
 */
function setFakeDate(year, month, day) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(year, month, day));
}

afterEach(() => {
  vi.useRealTimers();
});

function expectedLast7Months(currentMonthIndex) {
  const names = [];
  for (let i = 6; i >= 0; i--) {
    const idx = (currentMonthIndex - i + 12) % 12;
    names.push(MONTH_NAMES[idx]);
  }
  return names;
}

describe('useProductionChartData', () => {
  describe('edge inputs', () => {
    it('returns 7 entries with zero leche and no meta for empty array', () => {
      setFakeDate(2026, 5, 15); // June 2026
      const { result } = renderHook(() => useProductionChartData([]));
      expect(result.current).toHaveLength(7);
      result.current.forEach(entry => {
        expect(entry.leche).toBe(0);
        expect(entry.meta).toBeUndefined();
      });
      // Verify month names are the last 7: Dic, Ene, Feb, Mar, Abr, May, Jun
      expect(result.current.map(e => e.name)).toEqual(
        expectedLast7Months(5)
      );
    });

    it('returns 7 entries with zero leche for null input', () => {
      setFakeDate(2026, 5, 15);
      const { result } = renderHook(() => useProductionChartData(null));
      expect(result.current).toHaveLength(7);
      result.current.forEach(entry => {
        expect(entry.leche).toBe(0);
      });
    });

    it('returns 7 entries with zero leche for undefined input', () => {
      setFakeDate(2026, 5, 15);
      const { result } = renderHook(() => useProductionChartData(undefined));
      expect(result.current).toHaveLength(7);
      result.current.forEach(entry => {
        expect(entry.leche).toBe(0);
      });
    });
  });

  describe('aggregation', () => {
    it('aggregates a single record into the correct month', () => {
      setFakeDate(2026, 5, 15); // June 2026 → last 7 months: Dic, Ene, Feb, Mar, Abr, May, Jun
      const resumen = [{ month: 6, totalLitros: 1200 }]; // June (1-based)
      const { result } = renderHook(() => useProductionChartData(resumen));
      const junEntry = result.current.find(e => e.name === 'Jun');
      expect(junEntry.leche).toBe(1200);
      expect(junEntry.meta).toBe(1260); // 1200 * 1.05
    });

    it('sums multiple records in the same month', () => {
      setFakeDate(2026, 5, 15); // June 2026
      const resumen = [
        { month: 6, totalLitros: 500 },
        { month: 6, totalLitros: 700 },
        { month: 6, totalLitros: 300 },
      ];
      const { result } = renderHook(() => useProductionChartData(resumen));
      const junEntry = result.current.find(e => e.name === 'Jun');
      expect(junEntry.leche).toBe(1500); // 500 + 700 + 300
    });

    it('distributes records across different months', () => {
      setFakeDate(2026, 5, 15); // June 2026
      const resumen = [
        { month: 1, totalLitros: 1000 },  // Ene
        { month: 2, totalLitros: 1100 },  // Feb
        { month: 3, totalLitros: 1200 },  // Mar
      ];
      const { result } = renderHook(() => useProductionChartData(resumen));
      expect(result.current.find(e => e.name === 'Ene').leche).toBe(1000);
      expect(result.current.find(e => e.name === 'Feb').leche).toBe(1100);
      expect(result.current.find(e => e.name === 'Mar').leche).toBe(1200);
      expect(result.current.find(e => e.name === 'Abr').leche).toBe(0);
    });

    it('rounds decimal totalLitros', () => {
      setFakeDate(2026, 5, 15);
      const resumen = [{ month: 6, totalLitros: 1234.567 }];
      const { result } = renderHook(() => useProductionChartData(resumen));
      expect(result.current.find(e => e.name === 'Jun').leche).toBe(1235);
    });
  });

  describe('meta calculation', () => {
    it('sets meta = leche * 1.05 rounded when leche > 0', () => {
      setFakeDate(2026, 5, 15);
      const resumen = [{ month: 6, totalLitros: 2000 }];
      const { result } = renderHook(() => useProductionChartData(resumen));
      expect(result.current.find(e => e.name === 'Jun').meta).toBe(2100);
    });

    it('sets meta to undefined when leche is 0', () => {
      setFakeDate(2026, 5, 15);
      const resumen = [{ month: 6, totalLitros: 0 }];
      const { result } = renderHook(() => useProductionChartData(resumen));
      expect(result.current.find(e => e.name === 'Jun').meta).toBeUndefined();
    });

    it('sets meta to undefined for months with no data', () => {
      setFakeDate(2026, 5, 15);
      const { result } = renderHook(() => useProductionChartData([]));
      result.current.forEach(entry => {
        expect(entry.meta).toBeUndefined();
      });
    });
  });

  describe('year boundary', () => {
    it('handles months wrapping across year boundary (January)', () => {
      setFakeDate(2026, 0, 15); // January 2026
      // Last 7 months: Jul, Ago, Sep, Oct, Nov, Dic (2025), Ene (2026)
      const resumen = [
        { month: 12, totalLitros: 900 },  // Dec 2025
        { month: 1, totalLitros: 1100 },  // Jan 2026
      ];
      const { result } = renderHook(() => useProductionChartData(resumen));
      expect(result.current.map(e => e.name)).toEqual(expectedLast7Months(0));
      expect(result.current.find(e => e.name === 'Dic').leche).toBe(900);
      expect(result.current.find(e => e.name === 'Ene').leche).toBe(1100);
    });

    it('handles months wrapping across year boundary (March)', () => {
      setFakeDate(2026, 2, 10); // March 2026
      // Last 7 months: Sep, Oct, Nov, Dic (2025), Ene, Feb, Mar (2026)
      const resumen = [
        { month: 12, totalLitros: 800 },  // Dec 2025
        { month: 2, totalLitros: 600 },   // Feb 2026
      ];
      const { result } = renderHook(() => useProductionChartData(resumen));
      expect(result.current.map(e => e.name)).toEqual(expectedLast7Months(2));
      expect(result.current.find(e => e.name === 'Dic').leche).toBe(800);
      expect(result.current.find(e => e.name === 'Feb').leche).toBe(600);
    });
  });

  describe('month ordering', () => {
    it('returns months in chronological order (oldest first)', () => {
      setFakeDate(2026, 5, 15); // June
      const months = expectedLast7Months(5); // Dec, Jan, Feb, Mar, Apr, May, Jun
      const { result } = renderHook(() => useProductionChartData([]));
      expect(result.current.map(e => e.name)).toEqual(months);
    });
  });

  describe('memoization', () => {
    it('returns same reference for same input', () => {
      setFakeDate(2026, 5, 15);
      const resumen = [{ month: 6, totalLitros: 100 }];
      const { result, rerender } = renderHook(
        ({ input }) => useProductionChartData(input),
        { initialProps: { input: resumen } }
      );
      const first = result.current;
      rerender({ input: resumen });
      expect(result.current).toBe(first);
    });

    it('recomputes when input changes', () => {
      setFakeDate(2026, 5, 15);
      const { result, rerender } = renderHook(
        ({ input }) => useProductionChartData(input),
        { initialProps: { input: [] } }
      );
      expect(result.current.every(e => e.leche === 0)).toBe(true);
      rerender({ input: [{ month: 6, totalLitros: 500 }] });
      expect(result.current.find(e => e.name === 'Jun').leche).toBe(500);
    });
  });
});
