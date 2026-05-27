import { useMemo } from 'react';

/**
 * Computes age distribution from an array of animals.
 *
 * Groups:
 * - **terneros** (0-12 months old)
 * - **novillos** (12-24 months old)
 * - **adultos** (>24 months old)
 * - **sinDatos** (no valid fechaNacimiento)
 *
 * @param {Array} animales - Array of animal objects with optional `fechaNacimiento` field
 * @returns {{ terneros: number, novillos: number, adultos: number, sinDatos: number }}
 */
export function useAgeDistribution(animales) {
  return useMemo(() => {
    const groups = { terneros: 0, novillos: 0, adultos: 0, sinDatos: 0 };
    const now = new Date();

    (animales || []).forEach(a => {
      if (!a.fechaNacimiento) { groups.sinDatos++; return; }
      const birth = new Date(a.fechaNacimiento);
      if (isNaN(birth.getTime())) { groups.sinDatos++; return; }
      const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      if (months <= 12) groups.terneros++;
      else if (months <= 24) groups.novillos++;
      else groups.adultos++;
    });

    return groups;
  }, [animales]);
}
