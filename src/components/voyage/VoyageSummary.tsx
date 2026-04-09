import type { SeaLeg, PortEntry, StandbyEntry } from '../../types';
import { computeStaticConsumption } from '../../engine/consumption';

interface Props {
  legs: SeaLeg[];
  portEntry: PortEntry;
  standbyEntry: StandbyEntry;
  hotelLoad: number;
  sfocDet: number;
}

export default function VoyageSummary({ legs, portEntry, standbyEntry, hotelLoad, sfocDet }: Props) {
  const seaTotals = legs.reduce(
    (acc, l) => ({ hours: acc.hours + l.hours, distance: acc.distance + l.distance, hfo: acc.hfo + l.hfoMT, mgo: acc.mgo + l.mgoMT, lsfo: acc.lsfo + l.lsfoMT, total: acc.total + l.totalMT }),
    { hours: 0, distance: 0, hfo: 0, mgo: 0, lsfo: 0, total: 0 }
  );

  const portCalc = computeStaticConsumption(hotelLoad, portEntry.engineCount, portEntry.fuelType, sfocDet);
  const portFuel = { hfo: portCalc.perFuel.hfo * portEntry.hours, mgo: portCalc.perFuel.mgo * portEntry.hours, lsfo: portCalc.perFuel.lsfo * portEntry.hours, total: portCalc.rate * portEntry.hours };

  const stbyCalc = computeStaticConsumption(standbyEntry.avgPowerMW * 1000, standbyEntry.engineCount, standbyEntry.fuelType, sfocDet);
  const stbyFuel = { hfo: stbyCalc.perFuel.hfo * standbyEntry.hours, mgo: stbyCalc.perFuel.mgo * standbyEntry.hours, lsfo: stbyCalc.perFuel.lsfo * standbyEntry.hours, total: stbyCalc.rate * standbyEntry.hours };
  const hasStaticConstraint = portCalc.insufficient || stbyCalc.insufficient;

  const grand = {
    hours: seaTotals.hours + portEntry.hours + standbyEntry.hours,
    distance: seaTotals.distance,
    hfo: seaTotals.hfo + portFuel.hfo + stbyFuel.hfo,
    mgo: seaTotals.mgo + portFuel.mgo + stbyFuel.mgo,
    lsfo: seaTotals.lsfo + portFuel.lsfo + stbyFuel.lsfo,
    total: seaTotals.total + portFuel.total + stbyFuel.total,
  };

  const hasData = legs.length > 0 || portEntry.hours > 0 || standbyEntry.hours > 0;
  if (!hasData) return null;

  const rows = [
    ...(legs.length > 0 ? [{
      label: `Sea (${legs.length} leg${legs.length > 1 ? 's' : ''})`,
      hours: seaTotals.hours, distance: seaTotals.distance, hfo: seaTotals.hfo, mgo: seaTotals.mgo, lsfo: seaTotals.lsfo, total: seaTotals.total,
      style: '',
    }] : []),
    ...(portEntry.hours > 0 ? [{
      label: 'Port', hours: portEntry.hours, distance: 0, hfo: portFuel.hfo, mgo: portFuel.mgo, lsfo: portFuel.lsfo, total: portFuel.total,
      style: 'bg-mgo-light/50',
    }] : []),
    ...(standbyEntry.hours > 0 ? [{
      label: 'Standby', hours: standbyEntry.hours, distance: 0, hfo: stbyFuel.hfo, mgo: stbyFuel.mgo, lsfo: stbyFuel.lsfo, total: stbyFuel.total,
      style: 'bg-hfo-light/50',
    }] : []),
  ];

  return (
    <div className="mt-5">
      <div className="text-[0.7rem] font-bold tracking-[1.5px] uppercase text-dim mb-2.5 px-1 flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        Voyage Summary
      </div>
      {hasStaticConstraint && (
        <div className="mb-3 rounded-xl border border-danger/20 bg-danger-light px-4 py-3 text-[0.72rem] font-medium text-danger">
          Voyage totals include a capped burn rate for an overloaded port or standby setup. Reduce required power or increase selected engines before relying on these numbers.
        </div>
      )}
      <div className="rounded-xl border border-bdr overflow-hidden">
        <table className="w-full border-collapse text-[0.78rem]">
          <thead className="bg-surface-2/70">
            <tr>
              {['Segment', 'Hours', 'Distance (nm)', 'HFO (MT)', 'MGO (MT)', 'LSFO (MT)', 'Total (MT)'].map((h, i) => (
                <th key={i} scope="col" className={`py-2.5 px-3.5 text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim border-b border-bdr ${i === 0 ? 'text-left' : 'text-right'}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={`${row.style} hover:bg-surface-2/40 transition-colors`}>
                <td className="py-2.5 px-3.5 border-b border-bdr font-semibold">{row.label}</td>
                <td className="py-2.5 px-3.5 border-b border-bdr text-right font-mono tabular-nums">{row.hours.toFixed(1)}</td>
                <td className="py-2.5 px-3.5 border-b border-bdr text-right font-mono tabular-nums">{row.distance > 0 ? row.distance.toFixed(0) : '—'}</td>
                <td className="py-2.5 px-3.5 border-b border-bdr text-right font-mono tabular-nums text-hfo">{row.hfo.toFixed(1)}</td>
                <td className="py-2.5 px-3.5 border-b border-bdr text-right font-mono tabular-nums text-mgo">{row.mgo.toFixed(1)}</td>
                <td className="py-2.5 px-3.5 border-b border-bdr text-right font-mono tabular-nums text-lsfo">{row.lsfo.toFixed(1)}</td>
                <td className="py-2.5 px-3.5 border-b border-bdr text-right font-mono tabular-nums font-bold">{row.total.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-extrabold bg-surface-2/70">
              <td className="py-3.5 px-3.5 border-t-2 border-bdr">Grand Total</td>
              <td className="py-3.5 px-3.5 border-t-2 border-bdr text-right font-mono tabular-nums">{grand.hours.toFixed(1)}</td>
              <td className="py-3.5 px-3.5 border-t-2 border-bdr text-right font-mono tabular-nums">{grand.distance > 0 ? grand.distance.toFixed(0) : '—'}</td>
              <td className="py-3.5 px-3.5 border-t-2 border-bdr text-right font-mono tabular-nums text-hfo">{grand.hfo.toFixed(1)}</td>
              <td className="py-3.5 px-3.5 border-t-2 border-bdr text-right font-mono tabular-nums text-mgo">{grand.mgo.toFixed(1)}</td>
              <td className="py-3.5 px-3.5 border-t-2 border-bdr text-right font-mono tabular-nums text-lsfo">{grand.lsfo.toFixed(1)}</td>
              <td className="py-3.5 px-3.5 border-t-2 border-bdr text-right font-mono tabular-nums text-[1rem]">{grand.total.toFixed(1)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
