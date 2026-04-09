import type { VesselSettings } from '../../types';
import { DEFAULT_SETTINGS } from '../../data/engineDefaults';
import { useEffect, useId, useRef, useState } from 'react';

interface Props {
  open: boolean;
  settings: VesselSettings;
  onSave: (s: VesselSettings) => void;
  onClose: () => void;
}

export default function SettingsModal({ open, settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState(settings);
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) setLocal(settings); }, [open, settings]);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => firstFieldRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const fields: { label: string; key: keyof VesselSettings; hint: string; min: number; max: number; step: number }[] = [
    { label: 'Hotel Load', key: 'hotelLoad', hint: 'kW', min: 0, max: 20000, step: 100 },
    { label: 'Sea Margin', key: 'seaMargin', hint: '%', min: -10, max: 20, step: 0.5 },
    { label: 'SFOC Deterioration', key: 'sfocDet', hint: '%', min: 0, max: 5, step: 0.1 },
    { label: 'Propulsion Auxiliaries', key: 'propAux', hint: 'kW — bow thrusters, steering gear (when underway)', min: 0, max: 5000, step: 100 },
  ];

  return (
    <div
      className="fixed inset-0 bg-[rgba(26,34,51,0.45)] backdrop-blur-[4px] z-[1000] flex items-center justify-center animate-[fadeIn_0.2s_ease-out]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ overscrollBehavior: 'contain' }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="bg-surface border border-bdr rounded-[14px] w-[90%] max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-[slideUp_0.25s_ease-out] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ overscrollBehavior: 'contain' }}
      >
        <div className="flex items-center justify-between px-5 py-4 bg-surface-2 border-b border-bdr">
          <h3 id={titleId} className="text-[0.95rem] font-extrabold flex items-center gap-2">
            <svg className="w-4 h-4 text-dim" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <circle cx="12" cy="12" r="3" strokeWidth="2" />
            </svg>
            Vessel Configuration
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="w-7 h-7 rounded-md bg-transparent text-faint flex items-center justify-center text-lg hover:bg-danger-light hover:text-danger transition-[color,background-color] cursor-pointer"
          >
            ✕
          </button>
        </div>
        <div className="p-5">
          <p className="text-[0.72rem] text-dim mb-3.5 leading-relaxed">
            Hotel Load, Sea Margin, and SFOC Deterioration are editable directly in the Parameters panel.
            Use this dialog to set all values at once or adjust Propulsion Aux Load.
          </p>
          <div className="grid grid-cols-2 gap-3.5">
            {fields.map((f, idx) => {
              const inputId = `${titleId}-${f.key}`;
              const hintId = `${inputId}-hint`;
              return (
                <div key={f.key}>
                  <label htmlFor={inputId} className="block text-[0.72rem] font-bold tracking-[1.2px] uppercase text-dim mb-1">{f.label}</label>
                  <input
                    id={inputId}
                    name={String(f.key)}
                    ref={idx === 0 ? firstFieldRef : undefined}
                    type="number"
                    inputMode="decimal"
                    autoComplete="off"
                    spellCheck={false}
                    value={local[f.key]}
                    min={f.min}
                    max={f.max}
                    step={f.step}
                    aria-describedby={hintId}
                    onChange={(e) => setLocal({ ...local, [f.key]: parseFloat(e.target.value) || 0 })}
                    className="font-mono text-[0.9rem] font-semibold tabular-nums bg-surface-2 border border-bdr rounded-lg text-txt py-2 px-2.5 w-full outline-none focus:border-accent-band focus:shadow-[0_0_0_3px_rgba(37,99,235,0.1)] transition-[border-color,box-shadow]"
                  />
                  <div id={hintId} className="text-[0.7rem] text-dim mt-0.5">{f.hint}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="flex justify-between items-center px-5 py-3.5 border-t border-bdr bg-surface-2">
          <button
            type="button"
            onClick={() => setLocal(DEFAULT_SETTINGS)}
            className="text-[0.72rem] font-semibold border border-bdr rounded-lg py-2 px-4 bg-transparent text-dim hover:border-danger hover:text-danger hover:bg-danger-light transition-[color,background-color,border-color] cursor-pointer"
          >
            Restore Defaults
          </button>
          <button
            type="button"
            onClick={() => { onSave(local); onClose(); }}
            className="text-[0.78rem] font-bold rounded-lg py-2 px-5 bg-accent text-white border-none hover:bg-[#1d4ed8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.2)] transition-[background-color,box-shadow] cursor-pointer"
          >
            Save & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
