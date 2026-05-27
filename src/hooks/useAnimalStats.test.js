import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnimalStats } from './useAnimalStats';

describe('useAnimalStats', () => {
  it('returns zeros for an empty array', () => {
    const { result } = renderHook(() => useAnimalStats([]));
    expect(result.current).toEqual({ total: 0, enTratamiento: 0, activos: 0 });
  });

  it('returns zeros for null input', () => {
    const { result } = renderHook(() => useAnimalStats(null));
    expect(result.current).toEqual({ total: 0, enTratamiento: 0, activos: 0 });
  });

  it('returns zeros for undefined input', () => {
    const { result } = renderHook(() => useAnimalStats(undefined));
    expect(result.current).toEqual({ total: 0, enTratamiento: 0, activos: 0 });
  });

  it('counts total and activos for animals with estado "Activo"', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1', estado: 'Activo' },
      { id: 2, nombre: 'Vaca 2', estado: 'Activo' },
      { id: 3, nombre: 'Vaca 3', estado: 'Activo' },
    ];
    const { result } = renderHook(() => useAnimalStats(animales));
    expect(result.current).toEqual({ total: 3, enTratamiento: 0, activos: 3 });
  });

  it('counts enTratamiento for animals with "tratamiento" in estado (case insensitive)', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1', estado: 'En Tratamiento' },
      { id: 2, nombre: 'Vaca 2', estado: 'en tratamiento' },
      { id: 3, nombre: 'Vaca 3', estado: 'EN TRATAMIENTO' },
      { id: 4, nombre: 'Vaca 4', estado: 'Tratamiento Largo Plazo' },
    ];
    const { result } = renderHook(() => useAnimalStats(animales));
    expect(result.current).toEqual({ total: 4, enTratamiento: 4, activos: 0 });
  });

  it('counts activos for animals with estado "Saludable"', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1', estado: 'Saludable' },
      { id: 2, nombre: 'Vaca 2', estado: 'Activo' },
    ];
    const { result } = renderHook(() => useAnimalStats(animales));
    expect(result.current).toEqual({ total: 2, enTratamiento: 0, activos: 2 });
  });

  it('does not count animals without estado as activos or enTratamiento', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1' },
      { id: 2, nombre: 'Vaca 2', estado: '' },
      { id: 3, nombre: 'Vaca 3', estado: null },
    ];
    const { result } = renderHook(() => useAnimalStats(animales));
    expect(result.current).toEqual({ total: 3, enTratamiento: 0, activos: 0 });
  });

  it('correctly distinguishes between enTratamiento and activos in mixed data', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1', estado: 'Activo' },
      { id: 2, nombre: 'Vaca 2', estado: 'En Tratamiento' },
      { id: 3, nombre: 'Vaca 3', estado: 'Activo' },
      { id: 4, nombre: 'Vaca 4', estado: 'Saludable' },
      { id: 5, nombre: 'Vaca 5', estado: 'En Tratamiento' },
      { id: 6, nombre: 'Vaca 6', estado: 'Vendida' },
    ];
    const { result } = renderHook(() => useAnimalStats(animales));
    expect(result.current).toEqual({ total: 6, enTratamiento: 2, activos: 3 });
  });

  it('does not count animals with unrelated estados', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1', estado: 'Vendido' },
      { id: 2, nombre: 'Vaca 2', estado: 'Muerto' },
      { id: 3, nombre: 'Vaca 3', estado: 'Desconocido' },
    ];
    const { result } = renderHook(() => useAnimalStats(animales));
    expect(result.current).toEqual({ total: 3, enTratamiento: 0, activos: 0 });
  });

  it('memoizes the result for the same input reference', () => {
    const animales = [
      { id: 1, nombre: 'Vaca 1', estado: 'Activo' },
    ];

    const { result, rerender } = renderHook(
      ({ input }) => useAnimalStats(input),
      { initialProps: { input: animales } }
    );

    const firstResult = result.current;

    // Re-render with the same array reference
    rerender({ input: animales });

    expect(result.current).toBe(firstResult);
  });

  it('recomputes when input changes', () => {
    const animalesA = [{ id: 1, estado: 'Activo' }];
    const animalesB = [
      { id: 1, estado: 'Activo' },
      { id: 2, estado: 'En Tratamiento' },
    ];

    const { result, rerender } = renderHook(
      ({ input }) => useAnimalStats(input),
      { initialProps: { input: animalesA } }
    );

    expect(result.current).toEqual({ total: 1, enTratamiento: 0, activos: 1 });

    rerender({ input: animalesB });

    expect(result.current).toEqual({ total: 2, enTratamiento: 1, activos: 1 });
  });
});
