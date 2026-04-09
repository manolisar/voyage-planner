export default function Footer() {
  return (
    <footer className="text-center pt-10 pb-6">
      <div className="inline-block">
        <div className="w-8 h-px bg-gradient-to-r from-transparent via-faint to-transparent mx-auto mb-4" />
        <div className="font-mono text-[0.55rem] font-medium tracking-[4px] uppercase text-faint mb-1.5">
          created by,
        </div>
        <div className="font-sans text-[1.35rem] font-light tracking-tight text-faint">
          <span className="text-[#2E6F8E]">Manolis Archontakis</span>
          <span className="mx-1.5 font-extralight text-faint">×</span>
          <span className="text-[#DA7756]">Claude</span>
        </div>
      </div>
    </footer>
  );
}
