'use client';

import React, { useRef, useEffect, useCallback } from 'react';

interface Dot {
  ux: number; uy: number; uz: number; // Unit sphere coordinates
  ox: number; oy: number; oz: number; // Original coordinates scaled to sphereR
  nx: number; ny: number; nz: number; // Normal vector coordinates (same as ux, uy, uz)
  noiseX: number; noiseY: number; noiseZ: number; // Outward noise offset direction
  dissolveOffset: number;
  sparkleActive: boolean;
  sparkleTime: number;
  sparkleVal: number;

  // Intermediates calculated per frame
  dissolveState: number;
  rotatedX: number;
  rotatedY: number;
  rotatedZ: number;
  scale: number;
  screenX: number;
  screenY: number;
  depthFactor: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  opacity: number;
  color: string;
}

export default function PixelSphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Animation refs to avoid re-running useEffect on state changes
  const dotsRef = useRef<Dot[]>([]);
  const ambientParticlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const sparkleTimerRef = useRef<number>(0);

  // Layout & responsive refs
  const centerXRef = useRef<number>(0);
  const centerYRef = useRef<number>(0);
  const sphereRRef = useRef<number>(0);
  const isMobileRef = useRef<boolean>(false);

  // Rotation parameters
  const rotYRef = useRef<number>(0);
  const rotXRef = useRef<number>(0.25); // static tilt initial

  // Drag interaction refs
  const isDraggingRef = useRef<boolean>(false);
  const lastMouseXRef = useRef<number>(0);
  const lastMouseYRef = useRef<number>(0);
  const returnToStaticTimerRef = useRef<number | null>(null);

  // ── 1. Initialize Fibonacci Sphere Dots ─────────────────────
  const initDots = useCallback((totalDots: number, radius: number) => {
    const dots: Dot[] = [];
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < totalDots; i++) {
      const y = 1 - (i / (totalDots - 1)) * 2; // -1 to 1
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;

      // Noise direction offsets (stable per-dot offset)
      const noiseAngle = Math.random() * Math.PI * 2;
      const noisePitch = Math.acos(Math.random() * 2 - 1);
      
      dots.push({
        ux: x,
        uy: y,
        uz: z,
        ox: x * radius,
        oy: y * radius,
        oz: z * radius,
        nx: x,
        ny: y,
        nz: z,
        noiseX: Math.sin(noisePitch) * Math.cos(noiseAngle),
        noiseY: Math.sin(noisePitch) * Math.sin(noiseAngle),
        noiseZ: Math.cos(noisePitch),
        dissolveOffset: Math.random(),
        sparkleActive: false,
        sparkleTime: 0,
        sparkleVal: 0,
        dissolveState: 1,
        rotatedX: 0,
        rotatedY: 0,
        rotatedZ: 0,
        scale: 1,
        screenX: 0,
        screenY: 0,
        depthFactor: 0.5,
      });
    }
    dotsRef.current = dots;
  }, []);

  // ── 2. Initialize Ambient Space Particles ───────────────────
  const initAmbientParticles = useCallback((W: number, H: number) => {
    const particles: Particle[] = [];
    const colors = ['#2E7D32', '#1a3a1f'];
    
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() * 2 - 1) * 0.5,
        vy: (Math.random() * 2 - 1) * 0.5,
        r: Math.random() * 0.8 + 0.8, // 0.8px to 1.6px
        opacity: Math.random() * 0.09 + 0.03, // 0.03 to 0.12
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    ambientParticlesRef.current = particles;
  }, []);

  // ── 3. Handle Responsive Resize ─────────────────────────────
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const isMobile = W < 768;
    const radius = isMobile ? 160 : Math.min(W, H) * 0.28;

    centerXRef.current = W * 0.62;
    centerYRef.current = H * 0.44;
    sphereRRef.current = radius;
    isMobileRef.current = isMobile;

    const totalDots = isMobile ? 600 : 1200;
    // Re-scale or re-init dots
    if (dotsRef.current.length !== totalDots) {
      initDots(totalDots, radius);
    } else {
      // Re-scale existing dots without losing animated states
      dotsRef.current.forEach(dot => {
        dot.ox = dot.ux * radius;
        dot.oy = dot.uy * radius;
        dot.oz = dot.uz * radius;
      });
    }

    // Initialize or adapt ambient particles to new canvas bounds
    if (ambientParticlesRef.current.length === 0) {
      initAmbientParticles(W, H);
    }
  }, [initDots, initAmbientParticles]);

  // ── 4. Main Event Listeners for Interaction ──────────────────
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      // Allow drag interactions from the right 60% of the viewport (where the sphere sits)
      if (e.clientX > window.innerWidth * 0.4) {
        isDraggingRef.current = true;
        lastMouseXRef.current = e.clientX;
        lastMouseYRef.current = e.clientY;
        if (returnToStaticTimerRef.current) {
          cancelAnimationFrame(returnToStaticTimerRef.current);
        }
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - lastMouseXRef.current;
      const deltaY = e.clientY - lastMouseYRef.current;
      lastMouseXRef.current = e.clientX;
      lastMouseYRef.current = e.clientY;

      rotYRef.current += deltaX * 0.008;
      rotXRef.current += deltaY * 0.008;

      // Clamp X rotation to avoid folding
      rotXRef.current = Math.max(-0.8, Math.min(0.8, rotXRef.current));
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Mobile touch events
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch && touch.clientX > window.innerWidth * 0.4) {
        isDraggingRef.current = true;
        lastMouseXRef.current = touch.clientX;
        lastMouseYRef.current = touch.clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - lastMouseXRef.current;
      const deltaY = touch.clientY - lastMouseYRef.current;
      lastMouseXRef.current = touch.clientX;
      lastMouseYRef.current = touch.clientY;

      rotYRef.current += deltaX * 0.008;
      rotXRef.current += deltaY * 0.008;
      rotXRef.current = Math.max(-0.8, Math.min(0.8, rotXRef.current));
    };

    const handleTouchEnd = () => {
      isDraggingRef.current = false;
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    // Initial Resize and Setup
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', handleResize);
    };
  }, [handleResize]);

  // ── 5. Main Animation Loop ──────────────────────────────────
  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw solid dark green background first to clear trash buffers
    ctx.fillStyle = '#050f07';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const animate = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      const W = canvas.width;
      const H = canvas.height;
      const sphereR = sphereRRef.current;
      const centerX = centerXRef.current;
      const centerY = centerYRef.current;
      const isMobile = isMobileRef.current;

      // ── A. Background Motion Blur Trail ────────────────────
      ctx.fillStyle = 'rgba(5, 15, 7, 0.15)'; // fades old pixels slowly
      ctx.fillRect(0, 0, W, H);

      // ── B. Auto Rotate & Static Tilt Recovery ──────────────
      if (!isDraggingRef.current) {
        rotYRef.current += 0.004;
        // Slowly interpolate back to standard static tilt (0.25)
        rotXRef.current += (0.25 - rotXRef.current) * 0.05;
      }

      const rotY = rotYRef.current;
      const rotX = rotXRef.current;

      // ── C. Sparkle Trigger Accumulator (500ms intervals) ───
      sparkleTimerRef.current += dt;
      if (sparkleTimerRef.current >= 500) {
        sparkleTimerRef.current = 0;
        // Randomly select 8 dots on the front face that are solid enough to sparkle
        const candidates = dotsRef.current.filter(
          d => d.depthFactor > 0.6 && d.dissolveState > 0.8 && !d.sparkleActive
        );
        if (candidates.length > 0) {
          const count = Math.min(candidates.length, 8);
          for (let k = 0; k < count; k++) {
            const idx = Math.floor(Math.random() * candidates.length);
            const dot = candidates[idx];
            if (dot) {
              dot.sparkleActive = true;
              dot.sparkleTime = 0;
              dot.sparkleVal = 0;
              candidates.splice(idx, 1);
            }
          }
        }
      }

      // ── D. Update & Project Sphere Dots ────────────────────
      const dissolveProgress = Math.sin(time * 0.0003) * 0.5 + 0.5; // Wave oscillation
      const fov = 500;
      const driftAmount = 80; // Outward particle travel radius

      dotsRef.current.forEach((dot) => {
        // Animate sparkle progress
        if (dot.sparkleActive) {
          dot.sparkleTime += dt;
          if (dot.sparkleTime < 150) {
            dot.sparkleVal = dot.sparkleTime / 150; // Rising
          } else if (dot.sparkleTime < 750) {
            dot.sparkleVal = 1 - (dot.sparkleTime - 150) / 600; // Falling decay
          } else {
            dot.sparkleActive = false;
            dot.sparkleVal = 0;
          }
        }

        // Compute dissolve wave state (0 = dissolved, 1 = solid)
        const dissolveState = Math.max(0, Math.min(1, (dot.dissolveOffset - dissolveProgress) / 0.3));
        dot.dissolveState = dissolveState;

        // Apply outward drift + noise if dissolving
        const currentDrift = driftAmount * (1 - dissolveState);
        const noiseF = (1 - dissolveState) * 15;
        
        // Final position (scaled original + outward normal drift + noisy drift)
        const px = (dot.ux * sphereR) + (dot.nx * currentDrift) + (dot.noiseX * noiseF);
        const py = (dot.uy * sphereR) + (dot.ny * currentDrift) + (dot.noiseY * noiseF);
        const pz = (dot.uz * sphereR) + (dot.nz * currentDrift) + (dot.noiseZ * noiseF);

        // Rotate in 3D
        // Y-axis Rotation
        const x1 = px * Math.cos(rotY) + pz * Math.sin(rotY);
        const z1 = -px * Math.sin(rotY) + pz * Math.cos(rotY);
        // X-axis Rotation (tilt)
        const y2 = py * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = py * Math.sin(rotX) + z1 * Math.cos(rotX);

        dot.rotatedX = x1;
        dot.rotatedY = y2;
        dot.rotatedZ = z2;

        // Perspective Projection
        const scale = fov / (z2 + fov + sphereR);
        dot.scale = scale;
        dot.screenX = centerX + x1 * scale;
        dot.screenY = centerY + y2 * scale;

        // Depth sorting factor: 1.0 = near, 0.0 = far
        dot.depthFactor = (sphereR - z2) / (2 * sphereR);
      });

      // ── E. Depth Sort (Painter's Algorithm: back to front) ─
      // Large rotatedZ is far away (drawn first), small rotatedZ is closer (drawn last)
      const sortedDots = [...dotsRef.current].sort((a, b) => b.rotatedZ - a.rotatedZ);

      // ── F. Render Dots ─────────────────────────────────────
      sortedDots.forEach((dot) => {
        const depth = dot.depthFactor;
        const dState = dot.dissolveState;
        const scale = dot.scale;

        // Scale radius and opacity by depth and dissolve state
        const baseRadius = scale * 2.2 * (0.5 + depth * 0.5);
        const finalRadius = Math.max(0.2, baseRadius * (0.3 + dState * 0.7));

        const baseOpacity = 0.12 + depth * 0.78;
        const finalOpacity = baseOpacity * (0.1 + dState * 0.9);

        // Core / Depth layer color assignments
        let color = '#1a5c1e'; // dim far back
        if (depth > 0.75) color = '#a5d6a7'; // bright core front
        else if (depth > 0.45) color = '#66BB6A'; // leaf green mid
        else if (depth > 0.2) color = '#2E7D32'; // deep green

        let dotOpacity = finalOpacity;
        let dotColor = color;
        let shadowBlur = 0;

        // Sparkle overrides
        if (dot.sparkleActive) {
          dotColor = '#a5d6a7';
          dotOpacity = finalOpacity + (1.0 - finalOpacity) * dot.sparkleVal;
          shadowBlur = 14 * dot.sparkleVal;
        } else if (depth > 0.7 && dState > 0.7) {
          shadowBlur = scale * 6; // soft standard glow for front facing dots
        }

        ctx.beginPath();
        ctx.arc(dot.screenX, dot.screenY, finalRadius, 0, Math.PI * 2);
        
        ctx.shadowColor = '#66BB6A';
        ctx.shadowBlur = shadowBlur;
        ctx.fillStyle = dotColor;
        ctx.globalAlpha = Math.max(0, Math.min(1, dotOpacity));
        ctx.fill();
      });

      // Reset shadows and alpha for lines
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1.0;

      // ── G. Draw Mesh Connecting Lines (Desktop only) ───────
      if (!isMobile) {
        for (let i = 0; i < sortedDots.length; i++) {
          const d1 = sortedDots[i];
          if (d1.dissolveState < 0.3) continue;

          // Find nearby neighbors in screen distance
          const neighbors: { dot: Dot; dist: number }[] = [];
          for (let j = i + 1; j < sortedDots.length; j++) {
            const d2 = sortedDots[j];
            if (d2.dissolveState < 0.3) continue;

            const dx = d1.screenX - d2.screenX;
            const dy = d1.screenY - d2.screenY;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 38) {
              neighbors.push({ dot: d2, dist });
            }
          }

          // Limit to closest 3 connections
          neighbors.sort((a, b) => a.dist - b.dist);
          const limit = Math.min(neighbors.length, 3);

          for (let k = 0; k < limit; k++) {
            const n = neighbors[k];
            // Line opacity based on distance, start dot dissolve & depth
            const lineOpacity = 0.08 * (1 - n.dist / 38) * d1.dissolveState * d1.depthFactor;
            
            ctx.strokeStyle = `rgba(46, 125, 50, ${lineOpacity})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(d1.screenX, d1.screenY);
            ctx.lineTo(n.dot.screenX, n.dot.screenY);
            ctx.stroke();
          }
        }
      }

      // ── H. Draw Floating Ambient Particles ─────────────────
      ambientParticlesRef.current.forEach((p) => {
        // Slowly drift
        p.x += p.vx * 0.3;
        p.y += p.vy * 0.3;

        // Wrap around viewport edges
        if (p.x < 0) p.x += W;
        if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H;
        if (p.y > H) p.y -= H;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;
        ctx.fill();
      });

      // Reset global alpha
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        willChange: 'transform',
      }}
    />
  );
}
