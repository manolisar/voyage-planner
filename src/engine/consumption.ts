import { NOMINAL_KW } from '../data/trialData';
import { LOAD_LIMITS } from '../data/engineDefaults';
import { interpPropPower, interpSFOC } from './interpolation';
import { getEngineWithLimits, selectEngines, distributeLoad } from './loadSharing';
import type { EngineState, EngineResult, CalculationResult, FuelType, VesselSettings } from '../types';

export interface StaticConsumptionResult {
  rate: number;
  perFuel: { hfo: number; mgo: number; lsfo: number };
  availablePowerKW: number;
  insufficient: boolean;
}

export function computeConsumption(
  speed: number,
  engines: EngineState[],
  settings: VesselSettings
): CalculationResult {
  const allEngines = getEngineWithLimits(engines);
  const propKW = interpPropPower(speed);
  const propWithMargin = propKW * (1 + settings.seaMargin / 100);
  const propAux = speed > 0 ? settings.propAux : 0;
  const totalKW = propWithMargin + propAux + settings.hotelLoad;

  const { selected: runningEngines, allAvailable, insufficient } = selectEngines(
    allEngines,
    totalKW,
    speed
  );
  const numRunning = runningEngines.length;
  const runningIds = new Set(runningEngines.map((e) => e.id));

  const engineLoads = distributeLoad(runningEngines, totalKW);

  let hfoRate = 0, mgoRate = 0, lsfoRate = 0;

  runningEngines.forEach((e) => {
    const kw = engineLoads.get(e.id) || 0;
    const lf = kw / NOMINAL_KW;
    const baseSFOC = interpSFOC(lf);
    const sfoc = baseSFOC * (1 + settings.sfocDet / 100);
    const cons = (sfoc * kw) / 1e6;
    if (e.fuel === 'HFO') hfoRate += cons;
    else if (e.fuel === 'LSFO') lsfoRate += cons;
    else mgoRate += cons;
  });

  const engineResults: EngineResult[] = allEngines.map((eng) => {
    if (!eng.available) {
      return {
        id: eng.id, status: 'OFFLINE' as const, loadKW: 0, loadFraction: 0,
        loadLimit: eng.loadLimit, overloaded: false, fuelConsumption: 0, fuel: eng.fuel,
      };
    }
    if (runningIds.has(eng.id)) {
      const kw = engineLoads.get(eng.id) || 0;
      const lf = kw / NOMINAL_KW;
      const baseSFOC = interpSFOC(lf);
      const sfoc = baseSFOC * (1 + settings.sfocDet / 100);
      return {
        id: eng.id, status: 'RUNNING' as const, loadKW: kw, loadFraction: lf,
        loadLimit: eng.loadLimit, overloaded: lf > eng.loadLimit,
        fuelConsumption: (sfoc * kw) / 1e6, fuel: eng.fuel,
      };
    }
    return {
      id: eng.id, status: 'STANDBY' as const, loadKW: 0, loadFraction: 0,
      loadLimit: eng.loadLimit, overloaded: false, fuelConsumption: 0, fuel: eng.fuel,
    };
  });

  const avgLoadPercent = numRunning > 0 ? (totalKW / (numRunning * NOMINAL_KW)) * 100 : 0;

  return {
    propPowerKW: propWithMargin + propAux,
    totalPowerKW: totalKW,
    avgLoadPercent,
    engineResults,
    hfoRate, mgoRate, lsfoRate,
    totalRate: hfoRate + mgoRate + lsfoRate,
    insufficient,
    numRunning,
    numAvailable: allAvailable.length,
    hfoRunning: runningEngines.filter((e) => e.fuel === 'HFO').length,
    mgoRunning: runningEngines.filter((e) => e.fuel === 'MGO').length,
    lsfoRunning: runningEngines.filter((e) => e.fuel === 'LSFO').length,
  };
}

/** Compute fuel consumption for port/standby (no speed, custom power) */
export function computeStaticConsumption(
  totalPowerKW: number,
  engineCount: number,
  fuelType: FuelType,
  sfocDet: number
): StaticConsumptionResult {
  if (engineCount <= 0 || totalPowerKW <= 0) {
    return {
      rate: 0,
      perFuel: { hfo: 0, mgo: 0, lsfo: 0 },
      availablePowerKW: 0,
      insufficient: false,
    };
  }

  const loadLimit = LOAD_LIMITS[fuelType];
  const maxKW = NOMINAL_KW * loadLimit;
  const availablePowerKW = maxKW * engineCount;
  const perEngineKW = Math.min(totalPowerKW / engineCount, maxKW);
  const lf = perEngineKW / NOMINAL_KW;
  const baseSFOC = interpSFOC(lf);
  const sfoc = baseSFOC * (1 + sfocDet / 100);
  const perEngineCons = (sfoc * perEngineKW) / 1e6;
  const totalRate = perEngineCons * engineCount;

  const perFuel = { hfo: 0, mgo: 0, lsfo: 0 };
  if (fuelType === 'HFO') perFuel.hfo = totalRate;
  else if (fuelType === 'MGO') perFuel.mgo = totalRate;
  else perFuel.lsfo = totalRate;

  return {
    rate: totalRate,
    perFuel,
    availablePowerKW,
    insufficient: totalPowerKW > availablePowerKW,
  };
}
