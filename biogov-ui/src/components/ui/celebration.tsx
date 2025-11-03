'use client';

import { useEffect, useState } from 'react';

interface CelebrationProps {
  show: boolean;
  onComplete?: () => void;
}

export function Celebration({ show, onComplete }: CelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    if (show) {
      // Generate random confetti particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100, // Random horizontal position
        delay: Math.random() * 200, // Random delay for staggered effect
        duration: 1000 + Math.random() * 500, // Random duration between 1-1.5s
      }));
      setParticles(newParticles);

      // Clean up after animation completes
      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!show && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute top-0 w-3 h-3 rounded-full animate-confetti"
          style={{
            left: `${particle.left}%`,
            backgroundColor: [
              '#3B82F6', // Blue
              '#10B981', // Green
              '#F59E0B', // Amber
              '#EF4444', // Red
              '#8B5CF6', // Purple
              '#EC4899', // Pink
            ][Math.floor(Math.random() * 6)],
            animationDelay: `${particle.delay}ms`,
            animationDuration: `${particle.duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
