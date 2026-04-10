interface Props {
  onOpenSettings: () => void;
}

export default function Header({ onOpenSettings }: Props) {
  return (
    <header className="flex justify-between items-center py-6 mb-8">
      <div className="flex items-center gap-4">
        <div className="w-[46px] h-[46px] rounded-2xl flex items-center justify-center bg-gradient-to-br from-txt to-[#2d3a4f] text-white shadow-[0_2px_8px_rgba(26,34,51,0.2)]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="5" r="2" />
            <line x1="12" y1="7" x2="12" y2="19" />
            <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
            <line x1="5" y1="7" x2="19" y2="7" />
          </svg>
        </div>
        <div>
          <div className="text-[1.5rem] font-extrabold tracking-tight leading-tight">
            Speed <span className="text-faint font-light mx-0.5">→</span> Power <span className="text-faint font-light mx-0.5">→</span> Consumption
          </div>
          <div className="text-[0.7rem] text-dim tracking-[2px] uppercase font-medium font-mono mt-0.5">
            Dynamic Model Data · FAT SFOC · 4× Wärtsilä 16V46
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onOpenSettings}
        aria-label="Open vessel configuration"
        title="Vessel Configuration"
        className="w-[40px] h-[40px] rounded-xl border border-bdr bg-surface text-dim flex items-center justify-center hover:bg-surface-2 hover:text-txt hover:border-accent-band hover:shadow-[0_2px_8px_rgba(37,99,235,0.1)] transition-[background-color,color,border-color,box-shadow] duration-200 cursor-pointer group"
      >
        <svg className="w-[18px] h-[18px] transition-transform duration-300 group-hover:rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <circle cx="12" cy="12" r="3" strokeWidth="2" />
        </svg>
      </button>
    </header>
  );
}
