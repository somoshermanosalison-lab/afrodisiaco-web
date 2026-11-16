import type { VenueDimensions } from '@afrodisiaco/shared';
import { memo } from 'react';
import { DoubleSide } from 'three';
import { Label } from './Label';

/** El salón a escala: piso, muro del fondo y muros laterales translúcidos. */
export const Stage = memo(function Stage({ venue, receiveShadow }: { venue: VenueDimensions; receiveShadow: boolean }) {
  const { width, length, height } = venue;
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow={receiveShadow}>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial color="#1a1618" roughness={0.45} metalness={0.2} />
      </mesh>
      <gridHelper args={[Math.max(width, length), Math.round(Math.max(width, length)), '#3a3236', '#241e22']} position={[0, 0.004, 0]} scale={[width / Math.max(width, length), 1, length / Math.max(width, length)]} />
      {/* Muro del fondo */}
      <mesh position={[0, height / 2, -length / 2]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#2a2428" roughness={0.9} side={DoubleSide} />
      </mesh>
      {/* Muros laterales: translúcidos para ver el montaje desde afuera */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[(side * width) / 2, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[length, height]} />
          <meshStandardMaterial color="#2a2428" roughness={0.9} transparent opacity={0.18} side={DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      <Label
        text={`${width} m × ${length} m · altura ${height} m`}
        position={[0, 0.3, length / 2 + 0.5]}
        height={Math.max(0.35, Math.max(width, length) * 0.035)}
        color="#8c8790"
      />
    </group>
  );
});
