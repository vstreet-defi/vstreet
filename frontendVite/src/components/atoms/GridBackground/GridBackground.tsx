import { useRef, useEffect } from 'react';
import styles from './GridBackground.module.scss';

export function GridBackground() {
  const gridRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const handleMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
      
      if (gridRef.current) {
        const rotX = 28 + (mouseRef.current.y - 0.5) * 10;
        const rotY = (mouseRef.current.x - 0.5) * 8;
        gridRef.current.style.transform = `translate(-50%, -50%) perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  // Generate symmetric, slightly irregular grid lines
  const generateLines = (count: number) => {
    const right: number[] = [];
    let pos = 0;
    for (let i = 0; i < count; i++) {
      const gap = 9 + Math.sin(i * 1.1) * 2.5;
      pos += gap;
      right.push(pos);
    }
    const left = right.map(p => -p).reverse();
    return [...left, 0, ...right];
  };

  const hPositions = generateLines(8);
  const vPositions = generateLines(10);

  return (
    <div className={styles.container}>
      <div ref={gridRef} className={styles.gridPlane}>
        {/* Horizontal lines */}
        {hPositions.map((pos, i) => (
          <div
            key={`h-${i}`}
            className={styles.hLine}
            style={{ top: `${pos}%` }}
          />
        ))}
        {/* Vertical lines */}
        {vPositions.map((pos, i) => (
          <div
            key={`v-${i}`}
            className={styles.vLine}
            style={{ left: `${pos}%` }}
          />
        ))}
      </div>
    </div>
  );
}
