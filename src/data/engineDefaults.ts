import type { FuelType, EngineConfig } from '../types';

export const engineConfigs: EngineConfig[] = [
  { id: 1, label: 'DG1', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'] },
  { id: 2, label: 'DG2', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'] },
  { id: 3, label: 'DG3', mgoLocked: true, allowedFuels: ['MGO', 'LSFO'] },
  { id: 4, label: 'DG4', mgoLocked: false, allowedFuels: ['HFO', 'MGO', 'LSFO'] },
];

export const LOAD_LIMITS: Record<FuelType, number> = {
  HFO: 0.8,
  MGO: 0.7,
  LSFO: 0.8,
};

export const FUEL_PRIORITY: Record<FuelType, number> = {
  HFO: 0,
  LSFO: 1,
  MGO: 2,
};

export const DEFAULT_SETTINGS = {
  hotelLoad: 8000,
  seaMargin: 0,
  sfocDet: 2,
  propAux: 1500,
};
