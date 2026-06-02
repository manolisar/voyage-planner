import { useId } from 'react';

interface Props {
  cruiseName: string;
  from: string;
  to: string;
  date: string;
  onCruiseNameChange: (v: string) => void;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  onDateChange: (v: string) => void;
}

export default function VoyageMeta({ cruiseName, from, to, date, onCruiseNameChange, onFromChange, onToChange, onDateChange }: Props) {
  const baseId = useId();
  const cruiseId = `${baseId}-cruise`;
  const fromId = `${baseId}-from`;
  const toId = `${baseId}-to`;
  const dateId = `${baseId}-date`;

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={cruiseId} className="block text-[0.65rem] font-bold tracking-[1.5px] uppercase text-dim mb-1.5">Cruise Name</label>
        <input
          id={cruiseId}
          name="cruiseName"
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={cruiseName}
          onChange={(e) => onCruiseNameChange(e.target.value)}
          placeholder="e.g. British Isles & Scotland"
          className="text-[0.85rem] font-semibold bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
        />
      </div>
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
            className="text-[0.85rem] font-semibold bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
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
            className="text-[0.85rem] font-semibold bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
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
            className="font-mono text-[0.82rem] font-semibold tabular-nums bg-white border border-bdr rounded-xl text-txt py-2.5 px-3 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(6,182,212,0.15)] hover:border-faint transition-[border-color,box-shadow]"
          />
        </div>
      </div>
    </div>
  );
}
