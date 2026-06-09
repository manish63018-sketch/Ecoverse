'use client';

import { useRef, useEffect, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Dot {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  radius: number;
  baseOpacity: number;
  opacity: number;
  z: number;           // 0.0 (background) → 1.0 (foreground)
  phase: number;       // breathe phase offset (radians)
  speed: number;       // breathe speed (rad/ms)
  sparkle: number;     // 0 = off, 1 = full sparkle
  sparkleDecay: number;
  sparkleColor: boolean;
}

interface Wave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number; // px/ms
  alive: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

const BASE_COLOR   = hexToRgb('#1a3a1f');
const ACCENT_COLOR = hexToRgb('#66BB6A');

function dotColor(dot: Dot, waveBoost: number, sparkleBoost: number): { r: number; g: number; b: number } {
  if (sparkleBoost > 0) {
    return {
      r: lerp(BASE_COLOR.r, ACCENT_COLOR.r, sparkleBoost),
      g: lerp(BASE_COLOR.g, ACCENT_COLOR.g, sparkleBoost),
      b: lerp(BASE_COLOR.b, ACCENT_COLOR.b, sparkleBoost),
    };
  }
  if (waveBoost > 0) {
    return {
      r: lerp(BASE_COLOR.r, ACCENT_COLOR.r, waveBoost),
      g: lerp(BASE_COLOR.g, ACCENT_COLOR.g, waveBoost),
      b: lerp(BASE_COLOR.b, ACCENT_COLOR.b, waveBoost),
    };
  }
  return BASE_COLOR;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PixelBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We store all mutable animation state inside a single ref to keep the
  // render loop free from React re-renders.
  const stateRef = useRef({
    dots:         [] as Dot[],
    waves:        [] as Wave[],
    rafId:        0,
    lastTime:     0,
    globalAlpha:  1,          // driven by IntersectionObserver
    isMobile:     false,

    // Parallax
    mouseX:       0.5,
    mouseY:       0.5,
    offsetX:      0,
    offsetY:      0,
    targetOffX:   0,
    targetOffY:   0,

    // Auto-ripple
    autoRippleTimer: 0,
    AUTO_RIPPLE_INTERVAL: 6000,

    // Grid
    cols: 0,
    rows: 0,
    spacing: 28,
  });

  // ── Build dot grid ─────────────────────────────────────────────────────────
  const buildGrid = useCallback((width: number, height: number) => {
    const s       = stateRef.current;
    const spacing = s.isMobile ? 36 : 28;
    s.spacing     = spacing;

    const cols = Math.ceil(width  / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;
    s.cols = cols;
    s.rows = rows;

    const dots: Dot[] = [];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bx = col * spacing;
        const by = row * spacing;

        const z    = Math.random();             // depth 0–1
        const base = 0.08 + Math.random() * 0.10; // baseOpacity 0.08–0.18

        // Radius depends on z layer
        let radius: number;
        if      (z < 0.33) radius = 1.5;
        else if (z < 0.66) radius = 2.5;
        else               radius = 3.5;

        dots.push({
          x: bx, y: by,
          baseX: bx, baseY: by,
          radius,
          baseOpacity:  base,
          opacity:      base,
          z,
          phase:        Math.random() * Math.PI * 2,
          speed:        (2 * Math.PI) / (2500 + Math.random() * 2500), // one cycle in 2.5–5 s
          sparkle:      0,
          sparkleDecay: 0,
          sparkleColor: false,
        });
      }
    }

    // Sort back-to-front so foreground dots paint on top
    dots.sort((a, b) => a.z - b.z);

    stateRef.current.dots = dots;
  }, []);

  // ── Spawn a ripple wave ─────────────────────────────────────────────────────
  const spawnWave = useCallback((x: number, y: number, canvas: HTMLCanvasElement) => {
    const maxRadius = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    stateRef.current.waves.push({
      x, y,
      radius:    0,
      maxRadius,
      speed:     0.22, // px/ms  → 220 px/s
      alive:     true,
    });
  }, []);

  // ── Main animation tick ────────────────────────────────────────────────────
  const tick = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s  = stateRef.current;
    const dt = s.lastTime === 0 ? 16 : Math.min(timestamp - s.lastTime, 50);
    s.lastTime = timestamp;

    const W = canvas.width;
    const H = canvas.height;

    // ── Auto-ripple ──────────────────────────────────────────────────────────
    s.autoRippleTimer += dt;
    if (s.autoRippleTimer >= s.AUTO_RIPPLE_INTERVAL) {
      s.autoRippleTimer = 0;
      spawnWave(Math.random() * W, Math.random() * H, canvas);
    }

    // ── Parallax lerp ────────────────────────────────────────────────────────
    if (!s.isMobile) {
      s.targetOffX = (s.mouseX - 0.5) * -36;  // ±18 px
      s.targetOffY = (s.mouseY - 0.5) * -20;  // ±10 px
      s.offsetX = lerp(s.offsetX, s.targetOffX, 0.04);
      s.offsetY = lerp(s.offsetY, s.targetOffY, 0.04);
    }

    // ── Advance waves ────────────────────────────────────────────────────────
    for (const wave of s.waves) {
      wave.radius += wave.speed * dt;
      if (wave.radius > wave.maxRadius + 60) wave.alive = false;
    }
    s.waves = s.waves.filter(w => w.alive);

    // ── Clear ────────────────────────────────────────────────────────────────
    ctx.clearRect(0, 0, W, H);
    ctx.globalAlpha = s.globalAlpha;

    // ── Vignette brightness map (centre brighter) ─────────────────────────
    const cx = W / 2;
    const cy = H / 2;
    const maxDist = Math.sqrt(cx * cx + cy * cy);

    // ── Draw dots ────────────────────────────────────────────────────────────
    for (const dot of s.dots) {
      const t = timestamp; // ms

      // --- Layer 1: Breathe ---
      const breathe = Math.sin(t * dot.speed + dot.phase) * 0.06;

      // --- Opacity cap by z layer ---
      let opacityCap: number;
      if      (dot.z < 0.33) opacityCap = 0.10;
      else if (dot.z < 0.66) opacityCap = 0.20;
      else                   opacityCap = 0.35;

      // --- Layer 2: Parallax shift ---
      const parallaxScale = dot.z; // deeper z = more shift
      dot.x = dot.baseX + s.offsetX * parallaxScale;
      dot.y = dot.baseY + s.offsetY * parallaxScale;

      // Vignette: slightly brighter near center
      const dx      = dot.x - cx;
      const dy      = dot.y - cy;
      const dist    = Math.sqrt(dx * dx + dy * dy);
      const vignette = 1 - (dist / maxDist) * 0.4;

      // --- Layer 3: Wave boost ---
      let waveBoost = 0;
      const RING_THICKNESS = 60;
      for (const wave of s.waves) {
        const wdx  = dot.x - wave.x;
        const wdy  = dot.y - wave.y;
        const wdst = Math.sqrt(wdx * wdx + wdy * wdy);
        const inner = wave.radius - RING_THICKNESS;
        const outer = wave.radius;
        if (wdst >= inner && wdst <= outer) {
          const progress = (wdst - inner) / RING_THICKNESS;       // 0–1 within ring
          const bell     = Math.sin(progress * Math.PI);          // 0→1→0
          waveBoost = Math.max(waveBoost, bell * 0.7);
        }
      }

      // --- Layer 4: Sparkle decay ---
      if (dot.sparkle > 0) {
        dot.sparkle = Math.max(0, dot.sparkle - dot.sparkleDecay * dt);
      }

      const finalOpacity = Math.min(
        opacityCap,
        (dot.baseOpacity + breathe + waveBoost * 0.5 + dot.sparkle * 0.7) * vignette,
      );

      const color = dotColor(dot, waveBoost, dot.sparkle);

      ctx.beginPath();

      // --- Depth-of-field: background dots get a faint shadow blur ---
      if (dot.z < 0.33) {
        ctx.shadowBlur  = 1.5;
        ctx.shadowColor = `rgba(${color.r},${color.g},${color.b},0.3)`;
      } else if (dot.z >= 0.66) {
        ctx.shadowBlur  = 4;
        ctx.shadowColor = `rgba(${ACCENT_COLOR.r},${ACCENT_COLOR.g},${ACCENT_COLOR.b},${dot.sparkle * 0.5 + waveBoost * 0.3})`;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color.r},${color.g},${color.b},${finalOpacity})`;
      ctx.fill();
    }

    // Reset shadow for next frame
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    s.rafId = requestAnimationFrame(tick);
  }, [spawnWave]);

  // ── Sparkle scheduler ──────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const dots = stateRef.current.dots;
      if (dots.length === 0) return;
      const count = 1 + Math.floor(Math.random() * 3); // 1–3
      for (let i = 0; i < count; i++) {
        const dot = dots[Math.floor(Math.random() * dots.length)];
        dot.sparkle      = 1;
        dot.sparkleDecay = 1 / 600; // full fade over 600ms
        dot.sparkleColor = true;
      }
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // ── Main setup effect ─────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;

    // Detect mobile
    s.isMobile = window.innerWidth < 768;

    // ── Size canvas to its CSS size (DPR-aware) ──────────────────────────
    const resize = () => {
      const dpr  = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
      s.isMobile = window.innerWidth < 768;
      buildGrid(rect.width, rect.height);
    };

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // ── IntersectionObserver for scroll fade ──────────────────────────────
    const io = new IntersectionObserver(
      ([entry]) => { s.globalAlpha = entry.intersectionRatio; },
      { threshold: Array.from({ length: 101 }, (_, i) => i / 100) },
    );
    io.observe(canvas);

    // ── Mouse events ──────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      if (s.isMobile) return;
      const rect = canvas.getBoundingClientRect();
      s.mouseX = (e.clientX - rect.left) / rect.width;
      s.mouseY = (e.clientY - rect.top)  / rect.height;
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x    = e.clientX - rect.left;
      const y    = e.clientY - rect.top;
      spawnWave(x, y, canvas);
    };

    // Attach to the parent section so the whole hero is interactive
    const section = canvas.parentElement;
    section?.addEventListener('mousemove', onMouseMove);
    section?.addEventListener('click',     onClick);

    // ── Start RAF loop ────────────────────────────────────────────────────
    s.lastTime = 0;
    s.rafId    = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(s.rafId);
      ro.disconnect();
      io.disconnect();
      section?.removeEventListener('mousemove', onMouseMove);
      section?.removeEventListener('click',     onClick);
    };
  }, [buildGrid, tick, spawnWave]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position:        'absolute',
        inset:           0,
        width:           '100%',
        height:          '100%',
        pointerEvents:   'none',
        zIndex:          0,
        willChange:      'transform',
        display:         'block',
      }}
    />
  );
}
