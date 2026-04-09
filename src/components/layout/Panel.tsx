import { type ReactNode } from 'react';

const tagStyles: Record<string, string> = {
  param: 'bg-accent-light text-accent border border-accent-border',
  engine: 'bg-hfo-light text-hfo border border-hfo-border',
  result: 'bg-mgo-light text-mgo border border-mgo-border',
  legs: 'bg-[#f5f3ff] text-[#6d28d9] border border-[#ddd6fe]',
  voyage: 'bg-[#f0f9ff] text-[#0369a1] border border-[#bae6fd]',
};

interface Props {
  tag: string;
  tagStyle: keyof typeof tagStyles;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  delay?: number;
}

export default function Panel({ tag, tagStyle, title, badge, children, delay = 0 }: Props) {
  return (
    <div
      className="bg-surface border border-bdr rounded-2xl overflow-hidden mb-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_4px_12px_rgba(0,0,0,0.02)]"
      style={{ animation: `fadeUp 0.45s ease-out ${delay}s both` }}
    >
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-surface-2/70 border-b border-bdr">
        <span className={`text-[0.65rem] font-extrabold tracking-[1.5px] uppercase px-2.5 py-1 rounded-lg ${tagStyles[tagStyle]}`}>
          {tag}
        </span>
        <span className="font-bold text-[0.92rem]">{title}</span>
        {badge}
      </div>
      {children}
    </div>
  );
}
