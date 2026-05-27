import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDashboardAlerts } from './useDashboardAlerts';

const baseAgeDist = { adultos: 15, novillos: 8, terneros: 5, sinDatos: 0 };

describe('useDashboardAlerts', () => {
  it('returns only "empty" and no summary alert when total is 0', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 0, enTratamiento: 0, activos: 0, ageDist: baseAgeDist })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      id: 'empty',
      type: 'info',
      title: 'Sin datos aún',
    });
  });

  it('returns only "total" summary alert for healthy herd with no issues', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 28, enTratamiento: 0, activos: 28, ageDist: baseAgeDist })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({
      id: 'total',
      title: '28 animales registrados',
      desc: '15 adultos, 8 novillos, 5 terneros',
    });
  });

  it('adds critical alert when enTratamiento > 0', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 28, enTratamiento: 3, activos: 25, ageDist: baseAgeDist })
    );
    const ids = result.current.map(a => a.id);
    expect(ids).toContain('treat');
    const alert = result.current.find(a => a.id === 'treat');
    expect(alert).toMatchObject({
      type: 'critical',
      title: 'Animales en tratamiento',
      desc: '3 animales requieren atención veterinaria',
      time: 'Ahora',
    });
  });

  it('adds warning alert when activos < 50% of total', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 20, enTratamiento: 0, activos: 8, ageDist: baseAgeDist })
    );
    const ids = result.current.map(a => a.id);
    expect(ids).toContain('health');
    const alert = result.current.find(a => a.id === 'health');
    expect(alert).toMatchObject({
      type: 'warning',
      title: 'Baja proporción de activos',
      desc: 'Solo 40% de animales están activos/saludables',
    });
  });

  it('does NOT add warning when activos is exactly 50% of total', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 20, enTratamiento: 0, activos: 10, ageDist: baseAgeDist })
    );
    const ids = result.current.map(a => a.id);
    expect(ids).not.toContain('health');
  });

  it('adds info alert when ageDist.sinDatos > 0', () => {
    const ageDist = { ...baseAgeDist, sinDatos: 4 };
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 28, enTratamiento: 0, activos: 28, ageDist })
    );
    const ids = result.current.map(a => a.id);
    expect(ids).toContain('age');
    const alert = result.current.find(a => a.id === 'age');
    expect(alert).toMatchObject({
      type: 'info',
      title: 'Animales sin fecha de nacimiento',
      desc: '4 animales no tienen fecha registrada',
      time: 'Hoy',
    });
  });

  it('handles null ageDist without crashing and shows summary with zeros', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 28, enTratamiento: 0, activos: 28, ageDist: null })
    );
    // Should not crash — ageDist check is guarded
    const ids = result.current.map(a => a.id);
    expect(ids).not.toContain('age'); // null.ageDist check fails, so no sinDatos alert
    expect(ids).toContain('total');
    const alert = result.current.find(a => a.id === 'total');
    expect(alert.desc).toBe('0 adultos, 0 novillos, 0 terneros');
  });

  it('handles undefined ageDist without crashing', () => {
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 10, enTratamiento: 0, activos: 10, ageDist: undefined })
    );
    expect(result.current).toHaveLength(1);
    expect(result.current[0].id).toBe('total');
  });

  it('can generate all three optional alerts simultaneously', () => {
    const ageDist = { adultos: 5, novillos: 2, terneros: 1, sinDatos: 3 };
    const { result } = renderHook(() =>
      useDashboardAlerts({ total: 10, enTratamiento: 4, activos: 3, ageDist })
    );
    const ids = result.current.map(a => a.id);
    expect(ids).toContain('treat');   // critical
    expect(ids).toContain('age');     // info
    expect(ids).toContain('health');  // warning (3/10 = 30% < 50%)
    expect(ids).toContain('total');   // summary
    expect(result.current).toHaveLength(4);
  });

  it('memoizes the result for same props', () => {
    const props = { total: 28, enTratamiento: 2, activos: 26, ageDist: baseAgeDist };
    const { result, rerender } = renderHook(
      ({ total, enTratamiento, activos, ageDist }) =>
        useDashboardAlerts({ total, enTratamiento, activos, ageDist }),
      { initialProps: props }
    );
    const firstResult = result.current;
    rerender(props);
    expect(result.current).toBe(firstResult);
  });

  it('recomputes when total changes', () => {
    const { result, rerender } = renderHook(
      ({ total }) => useDashboardAlerts({ total, enTratamiento: 0, activos: total, ageDist: baseAgeDist }),
      { initialProps: { total: 10 } }
    );
    expect(result.current[0]?.title).toContain('10');

    rerender({ total: 25 });
    expect(result.current[0]?.title).toContain('25');
  });

  it('recomputes when enTratamiento crosses zero threshold', () => {
    const { result, rerender } = renderHook(
      ({ enTratamiento }) =>
        useDashboardAlerts({ total: 20, enTratamiento, activos: 18, ageDist: baseAgeDist }),
      { initialProps: { enTratamiento: 0 } }
    );
    expect(result.current.find(a => a.id === 'treat')).toBeUndefined();

    rerender({ enTratamiento: 1 });
    expect(result.current.find(a => a.id === 'treat')).toBeDefined();
  });

  it('recomputes when ageDist.sinDatos crosses zero threshold', () => {
    const ageDist0 = { ...baseAgeDist, sinDatos: 0 };
    const ageDist3 = { ...baseAgeDist, sinDatos: 3 };

    const { result, rerender } = renderHook(
      ({ ageDist }) =>
        useDashboardAlerts({ total: 20, enTratamiento: 0, activos: 20, ageDist }),
      { initialProps: { ageDist: ageDist0 } }
    );
    expect(result.current.find(a => a.id === 'age')).toBeUndefined();

    rerender({ ageDist: ageDist3 });
    expect(result.current.find(a => a.id === 'age')).toBeDefined();
  });
});
