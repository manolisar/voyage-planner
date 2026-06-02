import { useRef } from 'react';
import type { SeaLeg, PortEntry, StandbyEntry, AnchorageEntry, Voyage } from '../../types';
import { computeStaticConsumption, computePortConsumption } from '../../engine/consumption';

type LoadedVoyage = Pick<Voyage, 'cruiseName' | 'from' | 'to' | 'date' | 'seaLegs' | 'portEntry' | 'standbyEntry' | 'anchorageEntry'>;

function sanitizeFilename(s: string): string {
  return s.replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
}

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

function isAnchorageEntry(value: unknown): value is AnchorageEntry {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return (
    isFiniteNumber(entry.hours) &&
    isFiniteNumber(entry.engineCount) &&
    isFiniteNumber(entry.avgPowerMW) &&
    isFuelType(entry.fuelType)
  );
}

const DEFAULT_ANCHORAGE: AnchorageEntry = { hours: 0, engineCount: 2, avgPowerMW: 10, fuelType: 'MGO' };

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
    cruiseName: typeof voyage.cruiseName === 'string' ? voyage.cruiseName : '',
    from: voyage.from,
    to: voyage.to,
    date: voyage.date,
    seaLegs: voyage.seaLegs,
    portEntry: voyage.portEntry,
    standbyEntry: voyage.standbyEntry,
    anchorageEntry: isAnchorageEntry(voyage.anchorageEntry) ? voyage.anchorageEntry : { ...DEFAULT_ANCHORAGE },
  };
}

interface Props {
  cruiseName: string;
  from: string;
  to: string;
  date: string;
  legs: SeaLeg[];
  portEntry: PortEntry;
  standbyEntry: StandbyEntry;
  anchorageEntry: AnchorageEntry;
  hotelLoad: number;
  sfocDet: number;
  onLoadVoyage: (v: LoadedVoyage) => void;
}

export default function VoyageExport({ cruiseName, from, to, date, legs, portEntry, standbyEntry, anchorageEntry, hotelLoad, sfocDet, onLoadVoyage }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    const seaTotals = legs.reduce(
      (acc, l) => ({ hours: acc.hours + l.hours, dist: acc.dist + l.distance, hfo: acc.hfo + l.hfoMT, mgo: acc.mgo + l.mgoMT, lsfo: acc.lsfo + l.lsfoMT, total: acc.total + l.totalMT }),
      { hours: 0, dist: 0, hfo: 0, mgo: 0, lsfo: 0, total: 0 }
    );
    const portCalc = computePortConsumption(hotelLoad, portEntry.engineCount, portEntry.fuelType, sfocDet, portEntry.hours);
    const portFuel = { hfo: portCalc.perFuelMT.hfo, mgo: portCalc.perFuelMT.mgo, lsfo: portCalc.perFuelMT.lsfo, total: portCalc.totalMT };
    const stbyCalc = computeStaticConsumption(standbyEntry.avgPowerMW * 1000, standbyEntry.engineCount, standbyEntry.fuelType, sfocDet);
    const stbyFuel = { hfo: stbyCalc.perFuel.hfo * standbyEntry.hours, mgo: stbyCalc.perFuel.mgo * standbyEntry.hours, lsfo: stbyCalc.perFuel.lsfo * standbyEntry.hours, total: stbyCalc.rate * standbyEntry.hours };
    const anchCalc = computeStaticConsumption(anchorageEntry.avgPowerMW * 1000, anchorageEntry.engineCount, anchorageEntry.fuelType, sfocDet);
    const anchFuel = { hfo: anchCalc.perFuel.hfo * anchorageEntry.hours, mgo: anchCalc.perFuel.mgo * anchorageEntry.hours, lsfo: anchCalc.perFuel.lsfo * anchorageEntry.hours, total: anchCalc.rate * anchorageEntry.hours };

    if (portCalc.insufficient || stbyCalc.insufficient || anchCalc.insufficient) {
      alert('Cannot save voyage while port, anchorage, or standby power exceeds the selected engine capacity.');
      return;
    }

    const voyage: Voyage = {
      cruiseName, from, to, date, seaLegs: legs,
      portEntry, portFuel,
      standbyEntry, standbyFuel: stbyFuel,
      anchorageEntry, anchorageFuel: anchFuel,
      totals: {
        totalHours: seaTotals.hours + portEntry.hours + standbyEntry.hours + anchorageEntry.hours,
        totalDistanceNM: seaTotals.dist,
        hfoMT: seaTotals.hfo + portFuel.hfo + stbyFuel.hfo + anchFuel.hfo,
        mgoMT: seaTotals.mgo + portFuel.mgo + stbyFuel.mgo + anchFuel.mgo,
        lsfoMT: seaTotals.lsfo + portFuel.lsfo + stbyFuel.lsfo + anchFuel.lsfo,
        totalFuelMT: seaTotals.total + portFuel.total + stbyFuel.total + anchFuel.total,
      },
    };

    const safeName = sanitizeFilename(cruiseName) || 'Voyage';
    const filename = `${safeName} ${date}.json`;
    const json = JSON.stringify(voyage, null, 2);

    type FsPickerOptions = {
      suggestedName?: string;
      types?: { description?: string; accept: Record<string, string[]> }[];
    };
    type FsWritable = { write(data: string): Promise<void>; close(): Promise<void> };
    type FsHandle = { createWritable(): Promise<FsWritable> };
    const picker = (window as unknown as { showSaveFilePicker?: (opts: FsPickerOptions) => Promise<FsHandle> }).showSaveFilePicker;
    if (typeof picker === 'function') {
      try {
        const handle = await picker({
          suggestedName: filename,
          types: [{ description: 'Voyage JSON', accept: { 'application/json': ['.json'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(json);
        await writable.close();
        return;
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
        // Fall through to anchor download on any other failure
      }
    }

    const blob = new Blob([json], { type: 'application/json' });
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

  // Lightweight forecast tally for the export confirmation line.
  const seaT = legs.reduce((acc, l) => ({ hours: acc.hours + l.hours, total: acc.total + l.totalMT }), { hours: 0, total: 0 });
  const portC = computePortConsumption(hotelLoad, portEntry.engineCount, portEntry.fuelType, sfocDet, portEntry.hours);
  const stbyC = computeStaticConsumption(standbyEntry.avgPowerMW * 1000, standbyEntry.engineCount, standbyEntry.fuelType, sfocDet);
  const anchC = computeStaticConsumption(anchorageEntry.avgPowerMW * 1000, anchorageEntry.engineCount, anchorageEntry.fuelType, sfocDet);
  const totalHours = seaT.hours + portEntry.hours + standbyEntry.hours + anchorageEntry.hours;
  const totalMT = seaT.total + portC.totalMT + stbyC.rate * standbyEntry.hours + anchC.rate * anchorageEntry.hours;
  const segments = (legs.length > 0 ? 1 : 0) + (portEntry.hours > 0 ? 1 : 0) + (anchorageEntry.hours > 0 ? 1 : 0) + (standbyEntry.hours > 0 ? 1 : 0);
  const hasData = segments > 0;

  return (
    <div className="mt-5 pt-5 border-t border-bdr space-y-3">
      <div className="text-[0.7rem] font-bold tracking-[1.5px] uppercase text-dim flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        Export Forecast
      </div>

      <div className="rounded-xl border border-bdr bg-surface-2/60 px-4 py-2.5 text-[0.72rem] text-dim flex flex-wrap items-center gap-x-2 gap-y-1">
        {hasData ? (
          <>
            <span className="font-semibold text-txt">{cruiseName || 'Untitled forecast'}</span>
            <span className="text-faint">·</span>
            <span className="font-mono tabular-nums">{legs.length} leg{legs.length === 1 ? '' : 's'}</span>
            <span className="text-faint">·</span>
            <span className="font-mono tabular-nums">{segments} segment{segments === 1 ? '' : 's'}</span>
            <span className="text-faint">·</span>
            <span className="font-mono tabular-nums">{totalHours.toFixed(1)} h</span>
            <span className="text-faint">·</span>
            <span className="font-mono tabular-nums font-bold text-accent">{totalMT.toFixed(1)} MT</span>
          </>
        ) : (
          <span>Add sea legs or port / anchorage / standby hours above to build a forecast before exporting.</span>
        )}
      </div>

      <div className="flex gap-2.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasData}
          className="text-[0.75rem] font-bold rounded-xl py-2.5 px-5 bg-accent text-white border-none hover:bg-ocean-600 hover:shadow-[0_4px_14px_rgba(6,182,212,0.25)] active:scale-[0.97] transition-[background-color,box-shadow,transform] cursor-pointer whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent disabled:hover:shadow-none disabled:active:scale-100"
        >
          Export Forecast JSON
        </button>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="text-[0.75rem] font-bold rounded-xl py-2.5 px-5 bg-white text-dim border border-bdr hover:border-accent-band hover:text-accent hover:shadow-[0_2px_8px_rgba(6,182,212,0.15)] transition-[color,border-color,box-shadow] cursor-pointer whitespace-nowrap"
        >
          Load Forecast
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleLoad}
        aria-label="Load forecast from JSON file"
        className="hidden"
      />
    </div>
  );
}
