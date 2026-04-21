import { type ReactNode } from 'react';

type PanelVariant = 'engines' | 'param' | 'result' | 'legs' | 'voyage';

const variantMap: Record<string, PanelVariant> = {
  engine: 'engines',
  param: 'param',
  result: 'result',
  legs: 'legs',
  voyage: 'voyage',
};

interface Props {
  tag: string;
  tagStyle: string;
  title: string;
  badge?: ReactNode;
  children: ReactNode;
  delay?: number;
}

export default function Panel({ tag, tagStyle, title, badge, children, delay = 0 }: Props) {
  const variant = variantMap[tagStyle] ?? 'param';
  return (
    <div
      className={`cat-card ${variant} mb-7`}
      style={{ animation: `slideUp 0.45s ease-out ${delay}s both` }}
    >
      <div className="cat-label">
        <span className="cat-tag">{tag}</span>
        <span className="cat-title">{title}</span>
        {badge && <span className="ml-auto">{badge}</span>}
      </div>
      {children}
    </div>
  );
}
