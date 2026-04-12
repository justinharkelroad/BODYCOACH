'use client';

import { useEffect, useRef, useState } from 'react';
import { isFeatureEnabled } from '@/lib/featureFlags';
import type { Milestone } from '../data/milestones';
import { Button } from '@/components/ui/button';

interface MilestoneCelebrationProps {
  milestone: Milestone;
  visible: boolean;
  onDismiss: () => void;
}

/**
 * Modal celebration for newly earned milestones
 */
export function MilestoneCelebration({
  milestone,
  visible,
  onDismiss,
}: MilestoneCelebrationProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const featureEnabled = isFeatureEnabled('milestones');

  useEffect(() => {
    if (!featureEnabled) return;

    if (visible) {
      setIsAnimating(true);

      // Play confetti animation if needed
      if (milestone.celebrationType === 'confetti' && confettiRef.current) {
        playConfetti(confettiRef.current);
      }
    } else {
      setIsAnimating(false);
    }
  }, [visible, milestone, featureEnabled]);

  // Feature flag check - AFTER hooks
  if (!featureEnabled || !visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Confetti canvas */}
      {milestone.celebrationType === 'confetti' && (
        <canvas
          ref={confettiRef}
          className="absolute inset-0 pointer-events-none"
        />
      )}

      {/* Card */}
      <div
        className={`
          relative bg-[var(--theme-surface)] rounded-3xl p-8 max-w-sm mx-4
          shadow-2xl transform transition-all duration-500
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}
      >
        {/* Icon */}
        <div
          className={`
            w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center
            bg-gradient-to-br from-[var(--theme-primary)] to-[var(--theme-accent)]
          `}
        >
          <span className="text-4xl">{milestone.icon}</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[var(--theme-text)] mb-2">
          {milestone.name}
        </h2>

        {/* Description */}
        <p className="text-sm text-center text-[var(--theme-text-secondary)] mb-4">
          {milestone.description}
        </p>

        {/* Celebration message */}
        <p className="text-lg text-center font-semibold text-[var(--theme-primary)] mb-6">
          {milestone.celebrationMessage}
        </p>

        {/* Dismiss button */}
        <Button
          onClick={onDismiss}
          className="w-full"
        >
          Awesome!
        </Button>
      </div>
    </div>
  );
}

/**
 * Simple confetti animation
 */
function playConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = window.innerWidth;
  const height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;

  interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    color: string;
    size: number;
    rotation: number;
    rotationSpeed: number;
  }

  const particles: Particle[] = [];
  const colors = ['#ff6b6b', '#feca57', '#48dbfb', '#ff9ff3', '#54a0ff', '#5f27cd'];

  // Create particles
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height - height,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * 3 + 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 10 + 5,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.2,
    });
  }

  let frameCount = 0;
  const maxFrames = 180; // 3 seconds at 60fps

  function animate() {
    if (!ctx) return;

    if (frameCount >= maxFrames) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    ctx.clearRect(0, 0, width, height);

    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
      ctx.restore();

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1; // gravity
      p.rotation += p.rotationSpeed;
      p.vx *= 0.99; // air resistance
    }

    frameCount++;
    requestAnimationFrame(animate);
  }

  animate();
}

/**
 * Provider component to show celebrations automatically
 */
interface MilestoneCelebrationProviderProps {
  currentCelebration: Milestone | null;
  onDismiss: () => void;
  children: React.ReactNode;
}

export function MilestoneCelebrationProvider({
  currentCelebration,
  onDismiss,
  children,
}: MilestoneCelebrationProviderProps) {
  return (
    <>
      {children}
      {currentCelebration && (
        <MilestoneCelebration
          milestone={currentCelebration}
          visible={true}
          onDismiss={onDismiss}
        />
      )}
    </>
  );
}
