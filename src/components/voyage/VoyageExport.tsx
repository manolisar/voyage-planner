import { useId, useRef } from 'react';
import type { SeaLeg, PortEntry, StandbyEntry, Voyage } from '../../types';
import { computeStaticConsumption } from '../../engine/consumption';

type LoadedVoyage = Pick<Voyage, 'from' | 'to' | 'date' | 'seaLegs' | 'portEntry' | 'standbyEntry'>;

function isFuelType(value: unknown): value is PortEntry['fuelType'] {
  return value === 'HFO' || value === 'MGO' || value === 'LSFO';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isSeaLeg(value: unknown): value is SeaLeg {
  if (!value || typeof value !== 'object') return false;
  const leg = value as Record<string, unknown>;
  return (
    typeof leg.id === 'string' &&
    isFiniteNumber(leg.speed) &&
    isFiniteNumber(leg.hours) &&
    isFiniteNumber(leg.distance) &&
    isFiniteNumber(leg.hfoMT) &&
    isFiniteNumber(leg.mgoMT) &&
    isFiniteNumber(leg.lsfoMT) &&
    isFiniteNumber(leg.totalMT)
  );
}

function isPortEntry(value: unknown): value is PortEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return isFiniteNumber(entry.hours) && isFiniteNumber(entry.engineCount) && isFuelType(entry.fuelType);
}

function isStandbyEntry(value: unknown): value is StandbyEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    isFiniteNumber(entry.hours) &&
    isFiniteNumber(entry.engineCount) &&
    isFiniteNumber(entry.avgPowerMW) &&
    isFuelType(entry.fuelType)
  );
}

function parseVoyage(value: unknown): LoadedVoyage | null {
  if (!value || typeof value !== 'object') return null;
  const voyage = value as Record<string, unknown>;
  if (
    typeof voyage.from !== 'string' ||
    typeof voyage.to !== 'string' ||
    typeof voyage.date !== 'string' ||
    !Array.isArray(voyage.seaLegs) ||
    !voyage.seaLegs.every(isSeaLeg) ||
    !isPortEntry(voyage.portEntry) ||
    !isStandbyEntry(voyage.standbyEntry)
  ) {
    return null;
  }

  return {
    from: voyage.from,
    to: voyage.to,
    date: voyage.date,
    seaLegs: voyage.seaLegs,
    portEntry: voyage.portEntry,
    standbyEntry: voyage.standbyEntry,
  };
}

interface Props {
  from: string;
  to: string;
  date: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onDateChange: (v: string) => void;
  legs: SeaLeg[];
  portEntry: PortEntry;
  standbyEntry: StandbyEntry;
  hotelLoad: number;
  sfocDet: number;
  onLoadVoyage: (v: LoadedVoyage) => void;
}

export default function VoyageExport({ from, to, date, onFromChange, onToChange, onDateChange, legs, portEntry, standbyEntry, hotelLoad, sfocDet, onLoadVoyage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const fromId = `${baseId}-from`;
  const toId = `${baseId}-to`;
  const dateId = `${baseId}-date`;

  const handleSave = () => {
    const seaTotals = legs.reduce(
      (acc, l) => ({ hours: acc.hours + l.hours, dist: acc.dist + l.distance, hfo: acc.hfo + l.hfoMT, mgo: acc.mgo + l.mgoMT, lsfo: acc.lsfo + l.lsfoMT, total: acc.total + l.totalMT }),
      { hours: 0, dist: 0, hfo: 0, mgo: 0, lsfo: 0, total: 0 }
    );
    const portCalc = computeStaticConsumption(hotelLoad, portEntry.engineCount, portEntry.fuelType, sfocDet);
    const portFuel = { hfo: portCalc.perFuel.hfo * portEntry.hours, mgo: portCalc.perFuel.mgo * portEntry.hours, lsfo: portCalc.perFuel.lsfo * portEntry.hours, total: portCalc.rate * portEntry.hours };
    const stbyCalc = computeStaticConsumption(standbyEntry.avgPowerMW * 1000, standbyEntry.engineCount, standbyEntry.fuelType, sfocDet);
    const stbyFuel = { hfo: stbyCalc.perFuel.hfo * standbyEntry.hours, mgo: stbyCalc.perFuel.mgo * standbyEntry.hours, lsfo: stbyCalc.perFuel.lsfo * standbyEntry.hours, total: stbyCalc.rate * standbyEntry.hours };

    if (portCalc.insufficient || stbyCalc.insufficient) {
      alert('Cannot save voyage while port or standby power exceeds the selected engine capacity.');
      return;
    }

    const voyage: Voyage = {
      from, to, date, seaLegs: legs, portEntry, portFuel, standbyEntry, standbyFuel: stbyFuel,
      totals: {
        totalHours: seaTotals.hours + portEntry.hours + standbyEntry.hours,
        totalDistanceNM: seaTotals.dist,
        hfoMT: seaTotals.hfo + portFuel.hfo + stbyFuel.hfo,
        mgoMT: seaTotals.mgo + portFuel.mgo + stbyFuel.mgo,
        lsfoMT: seaTotals.lsfo + portFuel.lsfo + stbyFuel.lsfo,
        totalFuelMT: seaTotals.total + portFuel.total + stbyFuel.total,
      },
    };

    const filename = `${from || 'Origin'} - ${to || 'Destination'} ${date}.json`;
    const blob = new Blob([JSON.stringify(voyage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const voyage = parseVoyage(JSON.parse(ev.target?.result as string));
        if (!voyage) throw new Error('Invalid voyage shape');
        onLoadVoyage(voyage);
      } catch { alert('Invalid voyage file.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 max-[600px]:grid-cols-1">
        <div>
          <label htmlFor={fromId} className="block text-[0.65rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">From</label>
          <input
            id={fromId}
            name="voyageFrom"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            placeholder="e.g. Piraeus"
            className="text-[0.85rem] font-semibold bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] hover:border-faint transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={toId} className="block text-[0.65rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">To</label>
          <input
            id={toId}
            name="voyageTo"
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            placeholder="e.g. Rotterdam"
            className="text-[0.85rem] font-semibold bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] hover:border-faint transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={dateId} className="block text-[0.65rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Date</label>
          <input
            id={dateId}
            name="voyageDate"
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="font-mono text-[0.82rem] font-semibold tabular-nums bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] hover:border-faint transition-[border-color,box-shadow]"
          />
        </div>
      </div>
      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          className="text-[0.75rem] font-bold rounded-xl py-2.5 px-5 bg-accent text-white border-none hover:bg-[#1d4ed8] hover:shadow-[0_4px_14px_rgba(37,99,235,0.25)] active:scale-[0.97] transition-[background-color,box-shadow,transform] cursor-pointer whitespace-nowrap"
        >
          Save Voyage
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[0.75rem] font-bold rounded-xl py-2.5 px-5 bg-white text-dim border border-bdr hover:border-accent-band hover:text-accent hover:shadow-[0_2px_8px_rgba(37,99,235,0.08)] transition-[color,border-color,box-shadow] cursor-pointer whitespace-nowrap"
        >
          Load Voyage
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleLoad}
        aria-label="Load voyage from JSON file"
        className="hidden"
      />
    </div>
  );
}
