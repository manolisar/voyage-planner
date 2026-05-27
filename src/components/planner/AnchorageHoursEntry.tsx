import { useId } from 'react';
import type { AnchorageEntry, FuelType } from '../../types';
import { computeStaticConsumption } from '../../engine/consumption';

interface Props {
  entry: AnchorageEntry;
  sfocDet: number;
  onChange: (e: AnchorageEntry) => void;
}

export default function AnchorageHoursEntry({ entry, sfocDet, onChange }: Props) {
  const totalPowerKW = entry.avgPowerMW * 1000;
  const { rate, insufficient, availablePowerKW } = computeStaticConsumption(totalPowerKW, entry.engineCount, entry.fuelType, sfocDet);
  const totalFuel = rate * entry.hours;
  const baseId = useId();
  const hoursId = `${baseId}-hours`;
  const enginesId = `${baseId}-engines`;
  const powerId = `${baseId}-power`;
  const fuelId = `${baseId}-fuel`;

  return (
    <div className="bg-anchor-light border border-anchor-border rounded-xl overflow-hidden relative pl-[18px] pr-5 py-4 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-anchor-band shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="font-bold text-[0.82rem] mb-3 flex items-center gap-2">
        <span className="text-anchor text-[1rem]">⚓</span>
        <span className="text-txt">Anchorage</span>
        <span className="font-mono text-[0.6rem] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-md bg-[rgba(14,116,144,0.1)] text-anchor">Tender Port · Thrusters · Azipods</span>
      </div>
      <div className="grid grid-cols-5 gap-3 max-[700px]:grid-cols-2">
        <div>
          <label htmlFor={hoursId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Total Hours</label>
          <input
            id={hoursId}
            name="anchorageHours"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={entry.hours}
            min={0}
            step={1}
            onChange={(e) => onChange({ ...entry, hours: parseFloat(e.target.value) || 0 })}
            className="font-mono text-[0.85rem] font-semibold tabular-nums bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full outline-none focus:border-anchor-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-anchor-border transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={enginesId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Engines</label>
          <input
            id={enginesId}
            name="anchorageEngines"
            type="number"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={entry.engineCount}
            min={1}
            max={4}
            step={1}
            onChange={(e) => onChange({ ...entry, engineCount: parseInt(e.target.value) || 2 })}
            className="font-mono text-[0.85rem] font-semibold tabular-nums bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full outline-none focus:border-anchor-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-anchor-border transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={powerId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Avg Power (MW)</label>
          <input
            id={powerId}
            name="anchoragePowerMW"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={entry.avgPowerMW}
            min={0}
            max={50}
            step={0.5}
            onChange={(e) => onChange({ ...entry, avgPowerMW: parseFloat(e.target.value) || 0 })}
            className="font-mono text-[0.85rem] font-semibold tabular-nums bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full outline-none focus:border-anchor-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-anchor-border transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={fuelId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Fuel Type</label>
          <select
            id={fuelId}
            name="anchorageFuelType"
            value={entry.fuelType}
            onChange={(e) => onChange({ ...entry, fuelType: e.target.value as FuelType })}
            className="font-mono text-[0.78rem] font-semibold bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full cursor-pointer outline-none hover:border-anchor-border transition-colors"
          >
            <option value="MGO">MGO</option>
            <option value="HFO">HFO</option>
            <option value="LSFO">LSFO</option>
          </select>
        </div>
        <div className="flex flex-col justify-end bg-white/60 rounded-lg p-2.5 -my-0.5">
          <div className="text-[0.6rem] font-bold tracking-[1.5px] uppercase text-dim mb-1">Consumption</div>
          <div className="font-mono text-[1.15rem] font-extrabold tabular-nums text-anchor leading-none">{totalFuel.toFixed(1)} <span className="text-[0.6rem] font-medium text-dim">MT</span></div>
          <div className="text-[0.58rem] text-dim font-mono tabular-nums mt-1">{rate.toFixed(3)} t/hr × {entry.hours}h</div>
        </div>
      </div>
      {insufficient && (
        <div className="mt-3 rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-[0.68rem] font-medium text-danger">
          Requested anchorage power exceeds the selected engines&apos; capacity. Available power with this setup is {availablePowerKW.toFixed(0)} kW.
        </div>
      )}
    </div>
  );
}
