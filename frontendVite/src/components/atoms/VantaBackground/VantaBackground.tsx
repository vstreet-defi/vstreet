/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { useRef, useEffect } from 'react';
import * as THREE from 'three';
// @ts-expect-error vanta has no types
import NET from 'vanta/dist/vanta.net.min';

interface Props {
  effect?: 'net' | 'waves' | 'rings';
}

let vantaInstance: any = null;

export function VantaBackground({ effect = 'net' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const commonConfig = {
      el: containerRef.current,
      THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1,
      scaleMobile: 1,
    };

    if (effect === 'net') {
      vantaInstance = NET({
        ...commonConfig,
        color: 0x00FFC4,
        backgroundColor: 0x0D0D14,
        points: 12,
        maxDistance: 25,
        spacing: 18,
        showDots: false,
      });
    }

    return () => {
      if (vantaInstance && typeof vantaInstance.destroy === 'function') {
        vantaInstance.destroy();
        vantaInstance = null;
      }
    };
  }, [effect]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
