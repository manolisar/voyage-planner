export type FuelType = 'HFO' | 'MGO' | 'LSFO';

export interface EngineConfig {
  id: number;
  label: string;
  mgoLocked: boolean;
  allowedFuels: FuelType[];
}

export interface EngineState {
  id: number;
  available: boolean;
  fuel: FuelType;
}

export interface EngineResult {
  id: number;
  status: 'RUNNING' | 'STANDBY' | 'OFFLINE';
  loadKW: number;
  loadFraction: number;
  loadLimit: number;
  overloaded: boolean;
  fuelConsumption: number;
  fuel: FuelType;
}

export interface VesselSettings {
  hotelLoad: number;
  seaMargin: number;
  sfocDet: number;
  propAux: number;
}

export interface CalculationResult {
  propPowerKW: number;
  totalPowerKW: number;
  avgLoadPercent: number;
  engineResults: EngineResult[];
  hfoRate: number;
  mgoRate: number;
  lsfoRate: number;
  totalRate: number;
  insufficient: boolean;
  numRunning: number;
  numAvailable: number;
  hfoRunning: number;
  mgoRunning: number;
  lsfoRunning: number;
}

export interface SeaLeg {
  id: string;
  speed: number;
  hours: number;
  distance: number;
  hfoMT: number;
  mgoMT: number;
  lsfoMT: number;
  totalMT: number;
}

export interface PortEntry {
  hours: number;
  engineCount: number;
  fuelType: FuelType;
}

export interface StandbyEntry {
  hours: number;
  engineCount: number;
  avgPowerMW: number;
  fuelType: FuelType;
}

export interface Voyage {
  from: string;
  to: string;
  date: string;
  seaLegs: SeaLeg[];
  portEntry: PortEntry;
  portFuel: { hfo: number; mgo: number; lsfo: number; total: number };
  standbyEntry: StandbyEntry;
  standbyFuel: { hfo: number; mgo: number; lsfo: number; total: number };
  totals: VoyageTotals;
}

export interface VoyageTotals {
  totalHours: number;
  totalDistanceNM: number;
  hfoMT: number;
  mgoMT: number;
  lsfoMT: number;
  totalFuelMT: number;
}
