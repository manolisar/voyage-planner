import { useId, useState } from 'react';
import type { SeaLeg, CalculationResult } from '../../types';

interface Props {
  legs: SeaLeg[];
  currentResult: CalculationResult;
  speed: number;
  onAddLeg: (leg: SeaLeg) => void;
  onRemoveLeg: (id: string) => void;
  onClearLegs: () => void;
}

export default function SeaLegPlanner({ legs, currentResult, speed, onAddLeg, onRemoveLeg, onClearLegs }: Props) {
  const [hours, setHours] = useState(24);
  const hoursId = useId();

  const handleClear = () => {
    if (legs.length === 0) return;
    if (window.confirm(`Clear all ${legs.length} planned legs? This cannot be undone.`)) {
      onClearLegs();
    }
  };

  const handleAdd = () => {
    if (hours <= 0) return;
    const r = currentResult;
    onAddLeg({
      id: crypto.randomUUID(),
      speed,
      hours,
      distance: speed * hours,
      hfoMT: r.hfoRate * hours,
      mgoMT: r.mgoRate * hours,
      lsfoMT: r.lsfoRate * hours,
      totalMT: r.totalRate * hours,
    });
  };

  const totals = legs.reduce(
    (acc, l) => ({
      hours: acc.hours + l.hours,
      distance: acc.distance + l.distance,
      hfo: acc.hfo + l.hfoMT,
      mgo: acc.mgo + l.mgoMT,
      lsfo: acc.lsfo + l.lsfoMT,
      total: acc.total + l.totalMT,
    }),
    { hours: 0, distance: 0, hfo: 0, mgo: 0, lsfo: 0, total: 0 }
  );

  return (
    <div>
      {/* Add Leg Controls */}
      <div className="flex gap-3 items-end px-5 py-4 flex-wrap">
        <div className="min-w-[130px]">
          <label htmlFor={hoursId} className="block text-[0.68rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Leg Duration</label>
          <input
            id={hoursId}
            name="legDurationHours"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={hours}
            min={0.1}
            step={0.5}
            onChange={(e) => setHours(parseFloat(e.target.value) || 0)}
            className="font-mono text-[0.9rem] font-semibold tabular-nums bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(37,99,235,0.08)] hover:border-faint transition-[border-color,box-shadow]"
          />
          <div className="text-[0.65rem] text-dim mt-1">hours</div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[0.78rem] font-bold rounded-xl py-2.5 px-5 bg-accent text-white border-none hover:bg-[#1d4ed8] hover:shadow-[0_4px_14px_rgba(37,99,235,0.25)] active:scale-[0.97] transition-[background-color,box-shadow,transform] cursor-pointer whitespace-nowrap"
        >
          + Add Leg
        </button>
      </div>

      {/* Table or Empty State */}
      {legs.length === 0 ? (
        <div className="text-center py-10 px-5 text-dim text-[0.82rem]">
          <div className="text-[2rem] mb-2 opacity-30">
            <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>
          </div>
          <div className="text-[0.9rem] font-semibold text-txt/60 mb-1">No legs planned yet</div>
          <div className="text-[0.78rem]">Set speed and parameters above, then click <strong className="text-accent">+ Add Leg</strong> to build your voyage.</div>
        </div>
      ) : (
        <>
          <table className="w-full border-collapse text-[0.82rem]">
            <caption className="sr-only">Planned sea legs with hours, distance, and fuel consumption per fuel type.</caption>
            <thead className="bg-surface-2">
              <tr>
                {['Leg', 'Speed (kn)', 'Hours', 'Distance (nm)', 'HFO (MT)', 'MGO (MT)', 'LSFO (MT)', 'Total (MT)', ''].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`py-2 px-4 text-[0.7rem] font-bold tracking-[1.2px] uppercase text-dim border-b border-bdr ${i === 0 ? 'text-center' : i >= 2 ? 'text-right' : 'text-left'} ${i === 8 ? 'w-10 text-center' : ''}`}
                  >
                    {i === 8 ? <span className="sr-only">Remove leg</span> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {legs.map((leg, i) => (
                <tr key={leg.id} className="hover:bg-accent-light/30 transition-colors">
                  <td className="py-2.5 px-4 border-b border-bdr text-center font-bold text-accent tabular-nums">{i + 1}</td>
                  <td className="py-2.5 px-4 border-b border-bdr font-mono tabular-nums">{leg.speed.toFixed(1)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums">{leg.hours.toFixed(1)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums">{leg.distance.toFixed(0)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums text-hfo">{leg.hfoMT.toFixed(1)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums text-mgo">{leg.mgoMT.toFixed(1)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums text-lsfo">{leg.lsfoMT.toFixed(1)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums font-bold">{leg.totalMT.toFixed(1)}</td>
                  <td className="py-2.5 px-4 border-b border-bdr text-center">
                    <button
                      type="button"
                      onClick={() => onRemoveLeg(leg.id)}
                      aria-label={`Remove leg ${i + 1}`}
                      className="bg-transparent border-none text-danger cursor-pointer text-[1em] px-1.5 py-0.5 rounded hover:bg-danger-light transition-colors"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-extrabold">
                <td className="py-3 px-4 border-t-2 border-bdr text-center">Σ</td>
                <td className="py-3 px-4 border-t-2 border-bdr"></td>
                <td className="py-3 px-4 border-t-2 border-bdr text-right font-mono tabular-nums">{totals.hours.toFixed(1)}</td>
                <td className="py-3 px-4 border-t-2 border-bdr text-right font-mono tabular-nums">{totals.distance.toFixed(0)}</td>
                <td className="py-3 px-4 border-t-2 border-bdr text-right font-mono tabular-nums text-hfo">{totals.hfo.toFixed(1)}</td>
                <td className="py-3 px-4 border-t-2 border-bdr text-right font-mono tabular-nums text-mgo">{totals.mgo.toFixed(1)}</td>
                <td className="py-3 px-4 border-t-2 border-bdr text-right font-mono tabular-nums text-lsfo">{totals.lsfo.toFixed(1)}</td>
                <td className="py-3 px-4 border-t-2 border-bdr text-right font-mono tabular-nums">{totals.total.toFixed(1)}</td>
                <td className="py-3 px-4 border-t-2 border-bdr"></td>
              </tr>
            </tfoot>
          </table>
          <div className="flex justify-end px-5 py-3 border-t border-bdr bg-surface-2/70">
            <button
              type="button"
              onClick={handleClear}
              className="text-[0.72rem] font-bold border border-bdr text-dim bg-transparent rounded-xl py-2 px-4 hover:border-danger hover:text-danger hover:bg-danger-light transition-[color,background-color,border-color] cursor-pointer"
            >
              Clear All Legs
            </button>
          </div>
        </>
      )}
    </div>
  );
}
