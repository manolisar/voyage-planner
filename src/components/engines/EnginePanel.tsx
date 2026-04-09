import Panel from '../layout/Panel';
import EngineCard from './EngineCard';
import { engineConfigs } from '../../data/engineDefaults';
import type { EngineState, EngineResult, FuelType } from '../../types';

interface Props {
  engines: EngineState[];
  results: EngineResult[];
  onToggle: (id: number, available: boolean) => void;
  onFuelChange: (id: number, fuel: FuelType) => void;
}

export default function EnginePanel({ engines, results, onToggle, onFuelChange }: Props) {
  return (
    <Panel tag="ENGINES" tagStyle="engine" title="Diesel Generators — Availability & Fuel" delay={0.12}>
      <div className="grid grid-cols-4 gap-3 py-3.5 px-5 max-[700px]:grid-cols-2">
        {engineConfigs.map((config, i) => (
          <EngineCard
            key={config.id}
            config={config}
            state={engines[i]}
            result={results[i]}
            onToggle={(v) => onToggle(config.id, v)}
            onFuelChange={(f) => onFuelChange(config.id, f)}
          />
        ))}
      </div>
    </Panel>
  );
}
