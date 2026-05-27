import { describe, it, expect, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAgeDistribution } from './useAgeDistribution';

afterEach(() => {
  vi.useRealTimers();
});

/**
 * Sets the fake system date so age calculations are deterministic.
 */
function setFakeDate(year, month, day) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(year, month, day));
}

/** Helper: create an animal with only the fields needed for age distribution. */
function animal(fechaNacimiento) {
  return { id: 1, nombre: 'Test', fechaNacimiento };
}

describe('useAgeDistribution', () => {
  describe('edge inputs', () => {
    it('returns all zeros for empty array', () => {
      setFakeDate(2026, 5, 15);
      const { result } = renderHook(() => useAgeDistribution([]));
      expect(result.current).toEqual({ terneros: 0, novillos: 0, adultos: 0, sinDatos: 0 });
    });

    it('returns all zeros for null input', () => {
      setFakeDate(2026, 5, 15);
      const { result } = renderHook(() => useAgeDistribution(null));
      expect(result.current).toEqual({ terneros: 0, novillos: 0, adultos: 0, sinDatos: 0 });
    });

    it('returns all zeros for undefined input', () => {
      setFakeDate(2026, 5, 15);
      const { result } = renderHook(() => useAgeDistribution(undefined));
      expect(result.current).toEqual({ terneros: 0, novillos: 0, adultos: 0, sinDatos: 0 });
    });
  });

  describe('age classification', () => {
    it('classifies animals <= 12 months as terneros', () => {
      setFakeDate(2026, 5, 15); // June 15, 2026
      const animales = [
        animal('2026-06-15'), // 0 months → ternero
        animal('2026-01-15'), // 5 months → ternero
        animal('2025-07-15'), // 11 months → ternero
        animal('2025-06-15'), // 12 months → ternero (boundary)
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 4, novillos: 0, adultos: 0, sinDatos: 0 });
    });

    it('classifies animals 13-24 months as novillos', () => {
      setFakeDate(2026, 5, 15); // June 15, 2026
      const animales = [
        animal('2025-05-15'), // 13 months → novillo
        animal('2024-12-15'), // 18 months → novillo
        animal('2024-07-15'), // 23 months → novillo
        animal('2024-06-15'), // 24 months → novillo (boundary)
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 0, novillos: 4, adultos: 0, sinDatos: 0 });
    });

    it('classifies animals > 24 months as adultos', () => {
      setFakeDate(2026, 5, 15); // June 15, 2026
      const animales = [
        animal('2024-05-15'), // 25 months → adulto
        animal('2023-06-15'), // 36 months → adulto
        animal('2020-06-15'), // 72 months → adulto
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 0, novillos: 0, adultos: 3, sinDatos: 0 });
    });

    it('classifies mixed ages correctly', () => {
      setFakeDate(2026, 5, 15); // June 15, 2026
      const animales = [
        animal('2026-04-15'), // 2 months  → ternero
        animal('2025-08-15'), // 10 months → ternero
        animal('2025-02-15'), // 16 months → novillo
        animal('2024-09-15'), // 21 months → novillo
        animal('2023-06-15'), // 36 months → adulto
        animal('2020-01-15'), // 77 months → adulto
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 2, novillos: 2, adultos: 2, sinDatos: 0 });
    });
  });

  describe('missing / invalid dates', () => {
    it('counts animals without fechaNacimiento as sinDatos', () => {
      setFakeDate(2026, 5, 15);
      const animales = [
        animal(null),
        animal(undefined),
        { id: 2, nombre: 'No date' }, // missing field entirely
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 0, novillos: 0, adultos: 0, sinDatos: 3 });
    });

    it('counts animals with invalid fechaNacimiento as sinDatos', () => {
      setFakeDate(2026, 5, 15);
      const animales = [
        animal('not-a-date'),
        animal(''),
        animal('2026-13-01'), // invalid month
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 0, novillos: 0, adultos: 0, sinDatos: 3 });
    });

    it('correctly mixes valid and invalid dates', () => {
      setFakeDate(2026, 5, 15);
      const animales = [
        animal(null),              // sinDatos
        animal('2026-03-15'),      // 3 months → ternero
        animal('invalid'),         // sinDatos
        animal('2025-01-15'),      // 17 months → novillo
        animal('2023-06-15'),      // 36 months → adulto
      ];
      const { result } = renderHook(() => useAgeDistribution(animales));
      expect(result.current).toEqual({ terneros: 1, novillos: 1, adultos: 1, sinDatos: 2 });
    });
  });

  describe('memoization', () => {
    it('returns same reference for same input', () => {
      setFakeDate(2026, 5, 15);
      const animales = [animal('2026-03-15')];
      const { result, rerender } = renderHook(
        ({ input }) => useAgeDistribution(input),
        { initialProps: { input: animales } }
      );
      const first = result.current;
      rerender({ input: animales });
      expect(result.current).toBe(first);
    });

    it('recomputes when input changes', () => {
      setFakeDate(2026, 5, 15);
      const { result, rerender } = renderHook(
        ({ input }) => useAgeDistribution(input),
        { initialProps: { input: [animal('2026-03-15')] } }
      );
      expect(result.current.terneros).toBe(1);
      rerender({ input: [] });
      expect(result.current.terneros).toBe(0);
    });
  });
});
