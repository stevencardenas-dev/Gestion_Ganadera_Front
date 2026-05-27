import { useMemo } from 'react';

/**
 * Generates dashboard alerts based on animal statistics.
 *
 * @param {Object} params
 * @param {number} params.total - Total number of animals
 * @param {number} params.enTratamiento - Animals in treatment
 * @param {number} params.activos - Active/healthy animals
 * @param {{ adultos: number, novillos: number, terneros: number, sinDatos: number }} params.ageDist - Age distribution
 * @returns {Array<{ id: string, type: string, title: string, desc: string, time: string }>}
 */
export function useDashboardAlerts({ total, enTratamiento, activos, ageDist }) {
  return useMemo(() => {
    const list = [];

    if (enTratamiento > 0) {
      list.push({ id: 'treat', type: 'critical', title: 'Animales en tratamiento', desc: `${enTratamiento} animales requieren atención veterinaria`, time: 'Ahora' });
    }

    if (ageDist && ageDist.sinDatos > 0) {
      list.push({ id: 'age', type: 'info', title: 'Animales sin fecha de nacimiento', desc: `${ageDist.sinDatos} animales no tienen fecha registrada`, time: 'Hoy' });
    }

    if (total > 0 && activos < total * 0.5) {
      list.push({ id: 'health', type: 'warning', title: 'Baja proporción de activos', desc: `Solo ${Math.round(activos / total * 100)}% de animales están activos/saludables`, time: 'Hoy' });
    }

    if (total === 0) {
      list.push({ id: 'empty', type: 'info', title: 'Sin datos aún', desc: 'Agrega animales y registros para ver estadísticas aquí', time: '—' });
    } else {
      const dist = ageDist || { adultos: 0, novillos: 0, terneros: 0 };
      list.push({ id: 'total', type: 'info', title: `${total} animales registrados`, desc: `${dist.adultos} adultos, ${dist.novillos} novillos, ${dist.terneros} terneros`, time: 'Actualizado' });
    }

    return list;
  }, [total, enTratamiento, activos, ageDist]);
}
