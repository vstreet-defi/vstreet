import { FC } from 'react';
import styles from './SectionGrid.module.scss';

type Variant = 'features' | 'vst' | 'shilling' | 'team';

interface Props {
  variant: Variant;
}

const STROKE = 'rgba(0, 255, 196, 0.10)';
const STROKE_W = 0.6;

const grids: Record<Variant, JSX.Element> = {
  features: (
    <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <line x1="0" y1="80" x2="500" y2="80" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="120" y1="200" x2="600" y2="200" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="0" y1="340" x2="450" y2="340" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="80" y1="0" x2="80" y2="420" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="260" y1="80" x2="260" y2="500" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="440" y1="0" x2="440" y2="340" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="260" y1="200" x2="440" y2="200" stroke={STROKE} strokeWidth={STROKE_W * 1.4} />
      <line x1="260" y1="200" x2="260" y2="340" stroke={STROKE} strokeWidth={STROKE_W * 1.4} />
    </svg>
  ),

  vst: (
    <svg viewBox="0 0 500 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <line x1="60" y1="0" x2="60" y2="600" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="180" y1="40" x2="180" y2="560" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="320" y1="0" x2="320" y2="600" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="440" y1="60" x2="440" y2="540" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="180" y1="150" x2="440" y2="150" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="60" y1="300" x2="320" y2="300" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="180" y1="450" x2="500" y2="450" stroke={STROKE} strokeWidth={STROKE_W} />
    </svg>
  ),

  shilling: (
    <svg viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <line x1="0" y1="60" x2="600" y2="60" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="0" y1="160" x2="520" y2="160" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="80" y1="260" x2="600" y2="260" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="0" y1="360" x2="480" y2="360" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="140" y1="60" x2="140" y2="360" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="340" y1="0" x2="340" y2="260" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="520" y1="160" x2="520" y2="400" stroke={STROKE} strokeWidth={STROKE_W} />
    </svg>
  ),

  team: (
    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <line x1="0" y1="120" x2="500" y2="120" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="0" y1="380" x2="500" y2="380" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="120" y1="0" x2="120" y2="500" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="380" y1="0" x2="380" y2="500" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="120" y1="250" x2="380" y2="250" stroke={STROKE} strokeWidth={STROKE_W * 1.3} />
      <line x1="250" y1="120" x2="250" y2="380" stroke={STROKE} strokeWidth={STROKE_W * 1.3} />
      <line x1="185" y1="215" x2="185" y2="285" stroke={STROKE} strokeWidth={STROKE_W} />
      <line x1="315" y1="215" x2="315" y2="285" stroke={STROKE} strokeWidth={STROKE_W} />
    </svg>
  ),
};

const SectionGrid: FC<Props> = ({ variant }) => {
  return (
    <div className={`${styles.grid} ${styles[variant]}`} aria-hidden="true">
      {grids[variant]}
    </div>
  );
};

export { SectionGrid };
export type { Variant };
