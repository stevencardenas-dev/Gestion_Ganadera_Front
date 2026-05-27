import { useMemo } from 'react';

const MONTH_NAMES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

/**
 * Aggregates raw production resumen data into monthly chart data for the last 7 months.
 *
 * @param {Array} resumen - Raw API data, each item: { month: number (1-based), totalLitros }
 * @returns {Array<{ name: string, leche: number, meta?: number }>}
 */
export function useProductionChartData(resumen) {
  return useMemo(() => {
    const data = resumen || [];

    // Aggregate all production records by month name
    const monthlyMap = {};
    data.forEach(r => {
      const monthKey = MONTH_NAMES[r.month - 1]; // API returns 1-based month
      monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + Number(r.totalLitros);
    });

    // Build chart data for the last 7 calendar months
    const now = new Date();
    const currentMonth = now.getMonth();
    const last7Months = [];
    for (let i = 6; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      last7Months.push(MONTH_NAMES[idx]);
    }

    return last7Months.map(m => {
      const val = monthlyMap[m] || 0;
      return {
        name: m,
        leche: Math.round(val),
        meta: val > 0 ? Math.round(val * 1.05) : undefined,
      };
    });
  }, [resumen]);
}
