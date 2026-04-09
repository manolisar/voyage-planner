import type { CalculationResult } from '../../types';

interface Props {
  result: CalculationResult;
}

export default function ResultsPanel({ result }: Props) {
  const r = result;

  return (
    <div className="sticky top-0 z-50 -mx-6 px-6 mb-7" style={{ animation: 'fadeUp 0.45s ease-out 0.18s both' }}>
      <div className="bg-[#f0f2f6] border border-[#d8dde6] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center">

          {/* Power */}
          <div className="px-4 py-3.5 flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-positive shrink-0" style={{ animation: 'pulse-dot 2s ease-in-out infinite' }} />
            <div>
              <div className="text-[0.5rem] font-semibold tracking-[1.5px] uppercase text-dim">Power</div>
              <div className="font-mono text-[1.05rem] font-bold tabular-nums text-txt leading-tight">
                {r.totalPowerKW.toFixed(0)} <span className="text-[0.5rem] font-normal text-dim">kW</span>
              </div>
            </div>
          </div>

          {/* Engines + Load */}
          <div className="px-4 py-3.5">
            <div className="text-[0.5rem] font-semibold tracking-[1.5px] uppercase text-dim">
              {r.numRunning}/{r.numAvailable} Engines
            </div>
            <div className="font-mono text-[1.05rem] font-bold tabular-nums text-txt leading-tight">
              {r.numRunning > 0 ? r.avgLoadPercent.toFixed(1) : '--'}<span className="text-[0.5rem] font-normal text-dim ml-0.5">% load</span>
            </div>
          </div>

          {/* HFO */}
          <div className="px-4 py-3.5 text-center">
            <div className="text-[0.5rem] font-bold tracking-[2px] uppercase text-hfo">HFO</div>
            <div className={`font-mono text-[1.05rem] font-bold tabular-nums leading-tight ${r.hfoRate > 0 ? 'text-hfo' : 'text-faint'}`}>
              {r.hfoRate.toFixed(2)}
            </div>
          </div>

          {/* MGO */}
          <div className="px-4 py-3.5 text-center">
            <div className="text-[0.5rem] font-bold tracking-[2px] uppercase text-mgo">MGO</div>
            <div className={`font-mono text-[1.05rem] font-bold tabular-nums leading-tight ${r.mgoRate > 0 ? 'text-mgo' : 'text-faint'}`}>
              {r.mgoRate.toFixed(2)}
            </div>
          </div>

          {/* LSFO */}
          <div className="px-4 py-3.5 text-center">
            <div className="text-[0.5rem] font-bold tracking-[2px] uppercase text-lsfo">LSFO</div>
            <div className={`font-mono text-[1.05rem] font-bold tabular-nums leading-tight ${r.lsfoRate > 0 ? 'text-lsfo' : 'text-faint'}`}>
              {r.lsfoRate.toFixed(2)}
            </div>
          </div>

          {/* t/h unit — shared for all three fuels */}
          <div className="pr-2 py-3.5">
            <div className="text-[0.5rem] font-normal text-dim">&nbsp;</div>
            <div className="font-mono text-[0.55rem] font-normal text-dim leading-tight">t/h</div>
          </div>

          {/* Total — hero number */}
          <div className="px-6 py-3.5 bg-accent text-center min-w-[120px] rounded-r-2xl">
            <div className="text-[0.5rem] font-bold tracking-[2px] uppercase text-blue-200">Total</div>
            <div className="font-mono text-[1.3rem] font-extrabold tabular-nums text-white leading-tight">
              {r.totalRate.toFixed(2)} <span className="text-[0.55rem] font-normal text-blue-200">t/h</span>
            </div>
          </div>
        </div>

        {/* Warning bar */}
        <div role="status" aria-live="polite">
          {r.insufficient && (
            <div className="text-center py-1.5 px-4 text-[0.72rem] font-bold text-danger bg-danger-light border-t border-danger/20">
              ⚠ Insufficient Power — increase available engines or reduce demand.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
