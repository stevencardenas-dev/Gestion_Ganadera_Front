import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProductionAverage } from './useProductionAverage';

describe('useProductionAverage', () => {
  it('returns null for empty array', () => {
    const { result } = renderHook(() => useProductionAverage([]));
    expect(result.current).toBeNull();
  });

  it('returns null for null input', () => {
    const { result } = renderHook(() => useProductionAverage(null));
    expect(result.current).toBeNull();
  });

  it('returns null for undefined input', () => {
    const { result } = renderHook(() => useProductionAverage(undefined));
    expect(result.current).toBeNull();
  });

  it('returns null when latest month has leche of 0', () => {
    const data = [
      { name: 'Ene', leche: 0 },
      { name: 'Feb', leche: 1200 },
      { name: 'Mar', leche: 0 }, // latest
    ];
    const { result } = renderHook(() => useProductionAverage(data));
    expect(result.current).toBeNull();
  });

  it('returns rounded daily average from the latest month', () => {
    const data = [
      { name: 'Ene', leche: 900 },
      { name: 'Feb', leche: 1200 },
      { name: 'Mar', leche: 1500 }, // latest
    ];
    const { result } = renderHook(() => useProductionAverage(data));
    // 1500 / 30 = 50
    expect(result.current).toBe(50);
  });

  it('rounds the result correctly', () => {
    const data = [
      { name: 'Ene', leche: 1250 }, // latest
    ];
    const { result } = renderHook(() => useProductionAverage(data));
    // 1250 / 30 = 41.666... → Math.round = 42
    expect(result.current).toBe(42);
  });

  it('uses only the last entry regardless of previous months', () => {
    const data = [
      { name: 'Ene', leche: 99999 }, // should be ignored
      { name: 'Feb', leche: 900 },   // latest
    ];
    const { result } = renderHook(() => useProductionAverage(data));
    // 900 / 30 = 30
    expect(result.current).toBe(30);
  });

  it('returns null when latest.leche is missing', () => {
    const data = [
      { name: 'Ene', leche: 500 },
      { name: 'Feb' }, // no leche field
    ];
    const { result } = renderHook(() => useProductionAverage(data));
    // latest?.leche is undefined, undefined > 0 is false → null
    expect(result.current).toBeNull();
  });

  it('memoizes the result for the same input reference', () => {
    const data = [
      { name: 'Ene', leche: 1200 },
      { name: 'Feb', leche: 1500 },
    ];
    const { result, rerender } = renderHook(
      ({ input }) => useProductionAverage(input),
      { initialProps: { input: data } }
    );
    const first = result.current;
    rerender({ input: data });
    expect(result.current).toBe(first);
  });

  it('recomputes when input changes', () => {
    const { result, rerender } = renderHook(
      ({ input }) => useProductionAverage(input),
      { initialProps: { input: [{ name: 'Ene', leche: 1200 }] } }
    );
    expect(result.current).toBe(40);

    rerender({ input: [{ name: 'Ene', leche: 900 }] });
    expect(result.current).toBe(30);
  });
});
