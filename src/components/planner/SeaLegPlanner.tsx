import { useId, useState } from 'react';
import type { SeaLeg, CalculationResult, VesselSettings, LegAssumptions } from '../../types';

interface Props {
  legs: SeaLeg[];
  currentResult: CalculationResult;
  speed: number;
  settings: VesselSettings;
  onAddLeg: (leg: SeaLeg) => void;
  onUpdateLeg: (leg: SeaLeg) => void;
  onRemoveLeg: (id: string) => void;
  onClearLegs: () => void;
}

const STALE_COLOR = '#f59e0b';

function engSig(a: LegAssumptions): string {
  const parts: string[] = [];
  if (a.hfoRunning) parts.push(`${a.hfoRunning}H`);
  if (a.mgoRunning) parts.push(`${a.mgoRunning}M`);
  if (a.lsfoRunning) parts.push(`${a.lsfoRunning}L`);
  return parts.length ? parts.join('·') : `${a.numRunning} DG`;
}

function assumptionsTitle(a: LegAssumptions, legSpeed: number): string {
  return `Captured setup — Speed ${legSpeed.toFixed(1)} kn · Sea margin ${a.seaMargin}% · SFOC det ${a.sfocDet}% · Hotel ${a.hotelLoad} kW · Prop-aux ${a.propAux} kW · ${engSig(a)}`;
}

export default function SeaLegPlanner({ legs, currentResult, speed, settings, onAddLeg, onUpdateLeg, onRemoveLeg, onClearLegs }: Props) {
  const [hours, setHours] = useState(24);
  const hoursId = useId();

  const currentAssumptions: LegAssumptions = {
    seaMargin: settings.seaMargin,
    sfocDet: settings.sfocDet,
    hotelLoad: settings.hotelLoad,
    propAux: settings.propAux,
    hfoRunning: currentResult.hfoRunning,
    mgoRunning: currentResult.mgoRunning,
    lsfoRunning: currentResult.lsfoRunning,
    numRunning: currentResult.numRunning,
  };

  const isStale = (leg: SeaLeg): boolean => {
    const a = leg.assumptions;
    if (!a) return false;
    return (
      leg.speed !== speed ||
      a.seaMargin !== currentAssumptions.seaMargin ||
      a.sfocDet !== currentAssumptions.sfocDet ||
      a.hotelLoad !== currentAssumptions.hotelLoad ||
      a.propAux !== currentAssumptions.propAux ||
      a.hfoRunning !== currentAssumptions.hfoRunning ||
      a.mgoRunning !== currentAssumptions.mgoRunning ||
      a.lsfoRunning !== currentAssumptions.lsfoRunning
    );
  };

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
      assumptions: { ...currentAssumptions },
    });
  };

  const handleRecalc = (leg: SeaLeg) => {
    const r = currentResult;
    onUpdateLeg({
      ...leg,
      speed,
      distance: speed * leg.hours,
      hfoMT: r.hfoRate * leg.hours,
      mgoMT: r.mgoRate * leg.hours,
      lsfoMT: r.lsfoRate * leg.hours,
      totalMT: r.totalRate * leg.hours,
      assumptions: { ...currentAssumptions },
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

  const staleCount = legs.filter(isStale).length;

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
            className="font-mono text-[0.9rem] font-semibold tabular-nums bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
          />
          <div className="text-[0.65rem] text-dim mt-1">hours</div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="text-[0.78rem] font-bold rounded-xl py-2.5 px-5 bg-accent text-white border-none hover:bg-ocean-600 hover:shadow-[0_4px_14px_rgba(6,182,212,0.25)] active:scale-[0.97] transition-[background-color,box-shadow,transform] cursor-pointer whitespace-nowrap"
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
          {/* Snapshot explainer */}
          <div className="mx-5 mb-3 rounded-lg border border-bdr bg-surface-2/60 px-3.5 py-2 text-[0.68rem] text-dim leading-relaxed">
            Each leg is a <strong className="text-txt font-semibold">snapshot</strong> of the setup when it was added — speed, engines, sea margin, SFOC, hotel &amp; prop-aux are frozen into its totals. Adjust the panel above, then press <span className="font-mono font-bold text-txt">↻</span> on a leg to update just that one.
            {staleCount > 0 && (
              <>
                {' '}
                <span className="inline-block w-1.5 h-1.5 rounded-full align-middle mr-1" style={{ backgroundColor: STALE_COLOR }} />
                <strong style={{ color: '#b45309' }}>{staleCount} leg{staleCount === 1 ? '' : 's'}</strong> no longer match the current panel.
              </>
            )}
          </div>

          <table className="w-full border-collapse text-[0.82rem]">
            <caption className="sr-only">Planned sea legs with hours, distance, and fuel consumption per fuel type. Each leg stores the setup assumptions captured when it was added.</caption>
            <thead className="bg-surface-2">
              <tr>
                {['Leg', 'Speed (kn) / Setup', 'Hours', 'Distance (nm)', 'HFO (MT)', 'MGO (MT)', 'LSFO (MT)', 'Total (MT)', ''].map((h, i) => (
                  <th
                    key={i}
                    scope="col"
                    className={`py-2 px-4 text-[0.7rem] font-bold tracking-[1.2px] uppercase text-dim border-b border-bdr ${i === 0 ? 'text-center' : i >= 2 ? 'text-right' : 'text-left'} ${i === 8 ? 'w-[72px] text-center' : ''}`}
                  >
                    {i === 8 ? <span className="sr-only">Leg actions</span> : h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {legs.map((leg, i) => {
                const stale = isStale(leg);
                return (
                  <tr key={leg.id} className="hover:bg-accent-light/30 transition-colors">
                    <td className="py-2.5 px-4 border-b border-bdr text-center font-bold text-accent tabular-nums align-top">{i + 1}</td>
                    <td className="py-2.5 px-4 border-b border-bdr font-mono tabular-nums align-top">
                      <div>{leg.speed.toFixed(1)}</div>
                      {leg.assumptions && (
                        <div
                          className="font-sans tracking-normal text-[0.6rem] text-dim flex items-center gap-1 mt-0.5"
                          title={assumptionsTitle(leg.assumptions, leg.speed)}
                        >
                          <span>{engSig(leg.assumptions)}</span>
                          <span className="text-faint">·</span>
                          <span>SM {leg.assumptions.seaMargin}%</span>
                          {stale && (
                            <span
                              className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ backgroundColor: STALE_COLOR }}
                              aria-label="Setup changed since this leg was added"
                            />
                          )}
                        </div>
                      )}
                    </td>
                    <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums align-top">{leg.hours.toFixed(1)}</td>
                    <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums align-top">{leg.distance.toFixed(0)}</td>
                    <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums text-hfo align-top">{leg.hfoMT.toFixed(1)}</td>
                    <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums text-mgo align-top">{leg.mgoMT.toFixed(1)}</td>
                    <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums text-lsfo align-top">{leg.lsfoMT.toFixed(1)}</td>
                    <td className="py-2.5 px-4 border-b border-bdr text-right font-mono tabular-nums font-bold align-top">{leg.totalMT.toFixed(1)}</td>
                    <td className="py-2.5 px-4 border-b border-bdr text-center whitespace-nowrap align-top">
                      <button
                        type="button"
                        onClick={() => handleRecalc(leg)}
                        aria-label={`Update leg ${i + 1} to current setup`}
                        title={stale ? 'Setup changed — update this leg to the current panel setup' : 'Recalculate this leg to the current panel setup'}
                        className={`bg-transparent border-none cursor-pointer text-[1em] px-1.5 py-0.5 rounded transition-colors ${stale ? 'hover:bg-[#fef3c7]' : 'text-dim hover:bg-surface-2'}`}
                        style={stale ? { color: '#d97706' } : undefined}
                      >
                        ↻
                      </button>
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
                );
              })}
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
