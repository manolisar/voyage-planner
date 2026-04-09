import { useState, useMemo } from 'react';
import './app.css';
import type { EngineState, FuelType, SeaLeg, PortEntry, StandbyEntry, VesselSettings, Voyage } from './types';
import { DEFAULT_SETTINGS } from './data/engineDefaults';
import { computeConsumption } from './engine/consumption';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Panel from './components/layout/Panel';
import ParametersPanel from './components/parameters/ParametersPanel';
import EnginePanel from './components/engines/EnginePanel';
import ResultsPanel from './components/results/ResultsPanel';
import SettingsModal from './components/settings/SettingsModal';
import SeaLegPlanner from './components/planner/SeaLegPlanner';
import PortHoursEntry from './components/planner/PortHoursEntry';
import StandbyHoursEntry from './components/planner/StandbyHoursEntry';
import VoyageSummary from './components/voyage/VoyageSummary';
import VoyageExport from './components/voyage/VoyageExport';

function getLocalDateString(now: Date): string {
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function App() {
  const [speed, setSpeed] = useState(15);
  const [settings, setSettings] = useState<VesselSettings>(DEFAULT_SETTINGS);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const [engines, setEngines] = useState<EngineState[]>([
    { id: 1, available: true, fuel: 'HFO' },
    { id: 2, available: true, fuel: 'HFO' },
    { id: 3, available: true, fuel: 'MGO' },
    { id: 4, available: true, fuel: 'HFO' },
  ]);

  const [legs, setLegs] = useState<SeaLeg[]>([]);
  const [portEntry, setPortEntry] = useState<PortEntry>({ hours: 0, engineCount: 1, fuelType: 'MGO' });
  const [standbyEntry, setStandbyEntry] = useState<StandbyEntry>({ hours: 0, engineCount: 2, avgPowerMW: 6, fuelType: 'MGO' });

  const [voyageFrom, setVoyageFrom] = useState('');
  const [voyageTo, setVoyageTo] = useState('');
  const [voyageDate, setVoyageDate] = useState(getLocalDateString(new Date()));

  const result = useMemo(
    () => computeConsumption(speed, engines, settings),
    [speed, engines, settings]
  );

  const handleToggle = (id: number, available: boolean) => {
    setEngines((prev) => prev.map((e) => (e.id === id ? { ...e, available } : e)));
  };

  const handleFuelChange = (id: number, fuel: FuelType) => {
    setEngines((prev) => prev.map((e) => (e.id === id ? { ...e, fuel } : e)));
  };

  const handleLoadVoyage = (v: Pick<Voyage, 'from' | 'to' | 'date' | 'seaLegs' | 'portEntry' | 'standbyEntry'>) => {
    setVoyageFrom(v.from);
    setVoyageTo(v.to);
    setVoyageDate(v.date);
    setLegs(v.seaLegs);
    setPortEntry(v.portEntry);
    setStandbyEntry(v.standbyEntry);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-6 pb-16">
      <Header onOpenSettings={() => setSettingsOpen(true)} />
      <SettingsModal open={settingsOpen} settings={settings} onSave={setSettings} onClose={() => setSettingsOpen(false)} />

      <EnginePanel engines={engines} results={result.engineResults} onToggle={handleToggle} onFuelChange={handleFuelChange} />
      <ParametersPanel speed={speed} settings={settings} onSpeedChange={setSpeed} onSettingsChange={setSettings} />
      <ResultsPanel result={result} />

      {/* Voyage Builder */}
      <Panel tag="PLAN" tagStyle="legs" title="Cruise Leg Planner" delay={0.24}>
        <SeaLegPlanner
          legs={legs} currentResult={result} speed={speed}
          onAddLeg={(leg) => setLegs((prev) => [...prev, leg])}
          onRemoveLeg={(id) => setLegs((prev) => prev.filter((l) => l.id !== id))}
          onClearLegs={() => setLegs([])}
        />
      </Panel>

      <Panel tag="VOYAGE" tagStyle="voyage" title="Voyage Builder" delay={0.3}>
        <div className="p-5 space-y-5">
          <VoyageExport
            from={voyageFrom} to={voyageTo} date={voyageDate}
            onFromChange={setVoyageFrom} onToChange={setVoyageTo} onDateChange={setVoyageDate}
            legs={legs} portEntry={portEntry} standbyEntry={standbyEntry}
            hotelLoad={settings.hotelLoad} sfocDet={settings.sfocDet}
            onLoadVoyage={handleLoadVoyage}
          />

          <div className="grid grid-cols-1 gap-4 mt-4">
            <PortHoursEntry entry={portEntry} hotelLoad={settings.hotelLoad} sfocDet={settings.sfocDet} onChange={setPortEntry} />
            <StandbyHoursEntry entry={standbyEntry} sfocDet={settings.sfocDet} onChange={setStandbyEntry} />
          </div>

          <VoyageSummary legs={legs} portEntry={portEntry} standbyEntry={standbyEntry} hotelLoad={settings.hotelLoad} sfocDet={settings.sfocDet} />
        </div>
      </Panel>

      <Footer />
    </div>
  );
}

export default App;
