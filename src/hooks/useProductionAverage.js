import { useMemo } from 'react';

/**
 * Computes the daily average production from the latest month's chart data.
 *
 * @param {Array<{ name: string, leche: number, meta?: number }>} productionByMonth - Monthly chart data
 * @returns {number|null} Daily average (rounded), or null if no data
 */
export function useProductionAverage(productionByMonth) {
  return useMemo(() => {
    if (!productionByMonth || productionByMonth.length === 0) return null;
    const latest = productionByMonth[productionByMonth.length - 1];
    return latest?.leche > 0 ? Math.round(latest.leche / 30) : null;
  }, [productionByMonth]);
}
