import { useEffect, useState } from 'react';

export type DeviceTier = 'mobile' | 'tablet' | 'desktop';

export interface DeviceProfile {
  tier: DeviceTier;
  /** true = se reducen sombras, resolución y efectos. */
  lowPower: boolean;
}

function detect(): DeviceProfile {
  const width = window.innerWidth;
  const tier: DeviceTier = width < 768 ? 'mobile' : width < 1024 ? 'tablet' : 'desktop';
  const nav = navigator as Navigator & { deviceMemory?: number };
  const weakHardware = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return { tier, lowPower: tier !== 'desktop' || weakHardware || reducedMotion };
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(detect);
  useEffect(() => {
    const onResize = () =>
      setProfile((prev) => {
        const next = detect();
        return prev.tier === next.tier && prev.lowPower === next.lowPower ? prev : next;
      });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return profile;
}

/** Ruta pública de un archivo dentro del configurador (respeta la base /configurador/). */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`;
}
