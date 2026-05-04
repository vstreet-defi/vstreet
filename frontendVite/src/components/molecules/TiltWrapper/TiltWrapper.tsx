import { ReactNode } from 'react';
import { useTilt } from '@/hooks/useTilt';

interface Props {
  children: ReactNode;
  className?: string;
  max?: number;
  scale?: number;
}

export function TiltWrapper({ children, className = '', max = 8, scale = 1.03 }: Props) {
  const { ref, style, onMouseMove, onMouseLeave } = useTilt({ max, scale });
  return (
    <div ref={ref} style={style} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className={className}>
      {children}
    </div>
  );
}
