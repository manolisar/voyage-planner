import { useId } from 'react';
import type { PortEntry, FuelType } from '../../types';
import { computeStaticConsumption } from '../../engine/consumption';

interface Props {
  entry: PortEntry;
  hotelLoad: number;
  sfocDet: number;
  onChange: (e: PortEntry) => void;
}

export default function PortHoursEntry({ entry, hotelLoad, sfocDet, onChange }: Props) {
  const { rate, insufficient, availablePowerKW } = computeStaticConsumption(hotelLoad, entry.engineCount, entry.fuelType, sfocDet);
  const totalFuel = rate * entry.hours;
  const baseId = useId();
  const hoursId = `${baseId}-hours`;
  const enginesId = `${baseId}-engines`;
  const fuelId = `${baseId}-fuel`;

  return (
    <div className="bg-mgo-light border border-mgo-border rounded-xl overflow-hidden relative pl-[18px] pr-5 py-4 before:content-[''] before:absolute before:top-0 before:bottom-0 before:left-0 before:w-[4px] before:bg-mgo-band shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="font-bold text-[0.82rem] mb-3 flex items-center gap-2">
        <span className="text-mgo text-[1rem]">⚓</span>
        <span className="text-txt">Port Hours</span>
        <span className="font-mono text-[0.6rem] font-bold tracking-[1px] uppercase px-2 py-0.5 rounded-md bg-[rgba(4,120,87,0.1)] text-mgo">Hotel Load Only</span>
      </div>
      <div className="grid grid-cols-4 gap-3 max-[700px]:grid-cols-2">
        <div>
          <label htmlFor={hoursId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Total Hours</label>
          <input
            id={hoursId}
            name="portHours"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            value={entry.hours}
            min={0}
            step={1}
            onChange={(e) => onChange({ ...entry, hours: parseFloat(e.target.value) || 0 })}
            className="font-mono text-[0.85rem] font-semibold tabular-nums bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full outline-none focus:border-mgo-band focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] hover:border-mgo-border transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={enginesId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Engines</label>
          <input
            id={enginesId}
            name="portEngines"
            type="number"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={entry.engineCount}
            min={1}
            max={4}
            step={1}
            onChange={(e) => onChange({ ...entry, engineCount: parseInt(e.target.value) || 1 })}
            className="font-mono text-[0.85rem] font-semibold tabular-nums bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full outline-none focus:border-mgo-band focus:shadow-[0_0_0_3px_rgba(16,185,129,0.08)] hover:border-mgo-border transition-[border-color,box-shadow]"
          />
        </div>
        <div>
          <label htmlFor={fuelId} className="block text-[0.62rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Fuel Type</label>
          <select
            id={fuelId}
            name="portFuelType"
            value={entry.fuelType}
            onChange={(e) => onChange({ ...entry, fuelType: e.target.value as FuelType })}
            className="font-mono text-[0.78rem] font-semibold bg-white border border-bdr rounded-lg text-txt py-2 px-2.5 w-full cursor-pointer outline-none hover:border-mgo-border transition-colors"
          >
            <option value="MGO">MGO</option>
            <option value="HFO">HFO</option>
            <option value="LSFO">LSFO</option>
          </select>
        </div>
        <div className="flex flex-col justify-end bg-white/60 rounded-lg p-2.5 -my-0.5">
          <div className="text-[0.6rem] font-bold tracking-[1.5px] uppercase text-dim mb-1">Consumption</div>
          <div className="font-mono text-[1.15rem] font-extrabold tabular-nums text-mgo leading-none">{totalFuel.toFixed(1)} <span className="text-[0.6rem] font-medium text-dim">MT</span></div>
          <div className="text-[0.58rem] text-dim font-mono tabular-nums mt-1">{rate.toFixed(3)} t/hr × {entry.hours}h</div>
        </div>
      </div>
      {insufficient && (
        <div className="mt-3 rounded-lg border border-danger/20 bg-danger-light px-3 py-2 text-[0.68rem] font-medium text-danger">
          Hotel load exceeds the selected engines&apos; capacity. Available power with this setup is {availablePowerKW.toFixed(0)} kW.
        </div>
      )}
    </div>
  );
}
