import type { EngineConfig, EngineState, EngineResult, FuelType } from '../../types';

const fuelCardStyles: Record<FuelType, string> = {
  HFO: 'bg-hfo-light border-hfo-border before:bg-hfo-band',
  MGO: 'bg-mgo-light border-mgo-border before:bg-mgo-band',
  LSFO: 'bg-lsfo-light border-lsfo-border before:bg-lsfo-band',
};

const fuelBadgeStyles: Record<FuelType, string> = {
  HFO: 'bg-[rgba(217,119,6,0.15)] text-hfo',
  MGO: 'bg-[rgba(5,150,105,0.15)] text-mgo',
  LSFO: 'bg-[rgba(99,102,241,0.15)] text-lsfo',
};

const fuelBarColors: Record<FuelType, string> = {
  HFO: 'var(--color-hfo-band)',
  MGO: 'var(--color-mgo-band)',
  LSFO: 'var(--color-lsfo-band)',
};

interface Props {
  config: EngineConfig;
  state: EngineState;
  result: EngineResult;
  onToggle: (available: boolean) => void;
  onFuelChange: (fuel: FuelType) => void;
}

export default function EngineCard({ config, state, result, onToggle, onFuelChange }: Props) {
  const barPct = result.status === 'RUNNING'
    ? Math.min((result.loadFraction / result.loadLimit) * 100, 100)
    : 0;
  const barColor = result.overloaded ? 'var(--color-danger)' : fuelBarColors[state.fuel];

  return (
    <div className={`rounded-xl overflow-hidden relative pl-4 pr-3 pt-2.5 pb-2 border transition-[box-shadow,opacity,background-color,border-color] duration-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)] before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] ${fuelCardStyles[state.fuel]} ${!state.available ? 'opacity-35 hover:opacity-45' : ''}`}>
      {/* Name + Badge */}
      <div className="font-extrabold text-[0.85rem] mb-1.5 flex items-center gap-1.5">
        {config.label}
        <span className={`font-mono text-[0.62rem] font-bold tracking-[0.8px] px-1.5 py-0.5 rounded-md ${fuelBadgeStyles[state.fuel]}`}>
          {state.fuel}
        </span>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.8px] text-dim" aria-hidden="true">Off</span>
        <label className="relative w-9 h-5 cursor-pointer inline-block">
          <input
            type="checkbox"
            checked={state.available}
            onChange={(e) => onToggle(e.target.checked)}
            aria-label={`${config.label} available`}
            className="opacity-0 w-0 h-0 peer"
          />
          <span aria-hidden="true" className="absolute inset-0 bg-bdr rounded-full transition-colors duration-200 peer-checked:bg-positive peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:shadow-[0_1px_3px_rgba(0,0,0,0.15)] after:transition-transform after:duration-200 peer-checked:after:translate-x-4" />
        </label>
        <span className="text-[0.62rem] font-bold uppercase tracking-[0.8px] text-dim" aria-hidden="true">On</span>
      </div>

      {/* Fuel Select */}
      <select
        value={state.fuel}
        onChange={(e) => onFuelChange(e.target.value as FuelType)}
        aria-label={`${config.label} fuel type`}
        title={config.mgoLocked ? 'HFO not available on DG3' : undefined}
        className="font-mono text-[0.72rem] font-semibold bg-surface border border-bdr rounded-lg text-txt py-1 px-1.5 w-full cursor-pointer outline-none hover:border-faint transition-colors"
      >
        {config.allowedFuels.map((f) => (
          <option key={f} value={f}>{f} ({f === 'MGO' ? '70' : '80'}%)</option>
        ))}
      </select>
      {config.mgoLocked && (
        <div className="text-[0.65rem] text-dim mt-1 italic">No HFO bunker connection</div>
      )}

      {/* Status + Load */}
      <div className="flex items-center justify-between mt-1.5 mb-1">
        <div className={`font-mono text-[0.62rem] font-bold tracking-[1px] uppercase py-0.5 px-2 rounded-md ${
          result.status === 'RUNNING' ? 'bg-[rgba(5,150,105,0.12)] text-positive' :
          result.status === 'STANDBY' ? 'bg-surface-2 text-dim' :
          'bg-danger-light text-danger'
        }`}>
          {result.status}
        </div>
        <div className={`font-mono text-[0.78rem] font-bold tabular-nums ${result.overloaded ? 'text-danger' : 'text-txt'}`}>
          {result.status === 'RUNNING'
            ? `${result.overloaded ? '⚠ ' : ''}${(result.loadFraction * 100).toFixed(1)}%`
            : '--%'}
        </div>
      </div>

      {/* Load Bar */}
      <div
        className="h-[6px] rounded-full bg-bdr overflow-hidden"
        role="progressbar"
        aria-label={`${config.label} load`}
        aria-valuenow={Math.round(barPct)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="h-full rounded-full transition-[width,background-color] duration-500 ease-out"
          style={{ width: `${barPct}%`, background: barColor }} />
      </div>
    </div>
  );
}
