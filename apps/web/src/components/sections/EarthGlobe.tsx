'use client';

import { useRef, useEffect, useCallback } from 'react';

// ─── Continent patches: [lon, lat, radius] in degrees ────────────────────────
// We scatter extra dots around these seed points to simulate land masses
const CONTINENT_SEEDS: Array<{ lon: number; lat: number; r: number; density: number }> = [
  // Africa
  { lon: 20, lat: 5, r: 35, density: 4 },
  { lon: 30, lat: -20, r: 25, density: 3 },
  { lon: 15, lat: 15, r: 22, density: 3 },

  // Europe
  { lon: 15, lat: 52, r: 18, density: 3 },
  { lon: 25, lat: 45, r: 12, density: 2 },

  // Asia
  { lon: 80, lat: 40, r: 42, density: 5 },
  { lon: 105, lat: 30, r: 30, density: 4 },
  { lon: 135, lat: 36, r: 18, density: 3 },
  { lon: 60, lat: 55, r: 28, density: 3 },
  { lon: 40, lat: 30, r: 18, density: 2 },
  { lon: 78, lat: 22, r: 20, density: 3 }, // India!

  // North America
  { lon: -100, lat: 45, r: 38, density: 4 },
  { lon: -85, lat: 30, r: 22, density: 3 },
  { lon: -75, lat: 20, r: 14, density: 2 },

  // South America
  { lon: -58, lat: -10, r: 32, density: 4 },
  { lon: -65, lat: -30, r: 22, density: 3 },

  // Australia
  { lon: 133, lat: -25, r: 22, density: 3 },

  // Greenland
  { lon: -42, lat: 72, r: 18, density: 2 },

  // Antarctica
  { lon: 0, lat: -80, r: 30, density: 2 },
];

// ─── Convert lon/lat in degrees to unit-sphere XYZ ───────────────────────────
function lonLatToXYZ(lon: number, lat: number): [number, number, number] {
  const phi   = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return [
    -Math.sin(phi) * Math.cos(theta),
     Math.cos(phi),
     Math.sin(phi) * Math.sin(theta),
  ];
}

// ─── Dot type ─────────────────────────────────────────────────────────────────
interface GlobeDot {
  x: number; y: number; z: number;        // unit sphere
  isLand: boolean;
  brightness: number;                      // 0-1 jitter
  size: number;
}

function buildGlobeDots(count: number): GlobeDot[] {
  const dots: GlobeDot[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  // Base sphere — uniform fibonacci distribution
  for (let i = 0; i < count; i++) {
    const yy = 1 - (i / (count - 1)) * 2;
    const r   = Math.sqrt(1 - yy * yy);
    const th  = goldenAngle * i;
    const x   = Math.cos(th) * r;
    const z   = Math.sin(th) * r;

    // Convert to lon/lat to check continent membership
    const lat = Math.asin(yy) * (180 / Math.PI);
    const lon = Math.atan2(z, -x) * (180 / Math.PI); // -180 to 180

    let isLand = false;
    for (const seed of CONTINENT_SEEDS) {
      // Great-circle angular distance (simplified dot product)
      const [sx, sy, sz] = lonLatToXYZ(seed.lon, seed.lat);
      const dot = x * sx + yy * sy + z * sz;
      const angleDeg = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);
      if (angleDeg < seed.r) { isLand = true; break; }
    }

    dots.push({
      x, y: yy, z,
      isLand,
      brightness: 0.6 + Math.random() * 0.4,
      size: isLand ? 1.8 + Math.random() * 1.2 : 1.0 + Math.random() * 0.7,
    });
  }

  // Extra land-mass dots (denser continent fill)
  for (const seed of CONTINENT_SEEDS) {
    const [sx, sy, sz] = lonLatToXYZ(seed.lon, seed.lat);
    const extras = Math.floor(seed.density * 30);
    for (let k = 0; k < extras; k++) {
      // Random spread around seed, projected onto sphere
      const spreadRad = seed.r * (Math.PI / 180) * (0.3 + Math.random() * 0.7);
      const azimuth   = Math.random() * Math.PI * 2;
      // Tangent basis
      const up = [0, 1, 0];
      let tx = up[1] * sz - up[2] * sy;
      let ty = up[2] * sx - up[0] * sz;
      let tz = up[0] * sy - up[1] * sx;
      const tLen = Math.sqrt(tx*tx + ty*ty + tz*tz) || 1;
      tx /= tLen; ty /= tLen; tz /= tLen;
      // Bitangent
      const bx = sy * tz - sz * ty;
      const by = sz * tx - sx * tz;
      const bz = sx * ty - sy * tx;

      // Small rotation around seed
      const nx = sx + Math.sin(spreadRad) * (Math.cos(azimuth) * tx + Math.sin(azimuth) * bx);
      const ny = sy + Math.sin(spreadRad) * (Math.cos(azimuth) * ty + Math.sin(azimuth) * by);
      const nz = sz + Math.sin(spreadRad) * (Math.cos(azimuth) * tz + Math.sin(azimuth) * bz);
      const nl = Math.sqrt(nx*nx + ny*ny + nz*nz);
      dots.push({
        x: nx/nl, y: ny/nl, z: nz/nl,
        isLand: true,
        brightness: 0.7 + Math.random() * 0.3,
        size: 1.8 + Math.random() * 1.4,
      });
    }
  }

  return dots;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EarthGlobe() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef  = useRef({
    dots:      [] as GlobeDot[],
    rotY:      0,
    rotX:      0.18,           // slight axial tilt (like real Earth ~23°)
    dragX:     0,
    dragY:     0,
    isDragging:false,
    lastMX:    0,
    lastMY:    0,
    rafId:     0,
    lastTime:  0,
    pulse:     0,              // used for subtle atmosphere shimmer
  });

  // Build dots once on mount
  useEffect(() => {
    stateRef.current.dots = buildGlobeDots(1200);
  }, []);

  // ─── Main draw loop ─────────────────────────────────────────────────────────
  const draw = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const s  = stateRef.current;
    const dt = s.lastTime === 0 ? 16 : Math.min(timestamp - s.lastTime, 50);
    s.lastTime  = timestamp;
    s.pulse    += dt * 0.001;

    // Use logical pixel dimensions (DPR already handled by ctx.scale in resize)
    const W = parseFloat(canvas.dataset.logW || String(canvas.width));
    const H = parseFloat(canvas.dataset.logH || String(canvas.height));

    // ── Clear ──
    ctx.clearRect(0, 0, W, H);

    // ── Globe params ──
    const isMobile = W < 768;
    const R      = isMobile ? Math.min(W, H) * 0.40 : Math.min(W, H) * 0.60;
    const cx     = isMobile ? W * 0.5 : W * 0.68;
    const cy     = isMobile ? H * 0.75 : H * 0.48;
    const fov    = 2.8;                       // perspective strength

    // ── Auto-rotate ──
    if (!s.isDragging) {
      s.rotY += 0.003;
      s.rotX += (0.18 - s.rotX) * 0.02;
    }

    const cosY = Math.cos(s.rotY);
    const sinY = Math.sin(s.rotY);
    const cosX = Math.cos(s.rotX);
    const sinX = Math.sin(s.rotX);

    // ── Atmosphere glow (radial gradient behind globe) ──
    const atmoR  = R * 1.18;
    const atmoPulse = 0.35 + 0.05 * Math.sin(s.pulse * 1.3);
    const atmoGrad = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, atmoR);
    atmoGrad.addColorStop(0,   `rgba(46,125,50,${atmoPulse})`);
    atmoGrad.addColorStop(0.5, `rgba(27,94,32,${atmoPulse * 0.4})`);
    atmoGrad.addColorStop(1,   'rgba(5,15,7,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, atmoR, 0, Math.PI * 2);
    ctx.fillStyle = atmoGrad;
    ctx.fill();

    // ── Ocean tint (subtle dark sphere) ──
    const oceanGrad = ctx.createRadialGradient(
      cx - R * 0.25, cy - R * 0.25, 0,
      cx, cy, R,
    );
    oceanGrad.addColorStop(0,   'rgba(20,55,25,0.6)');
    oceanGrad.addColorStop(0.7, 'rgba(10,30,12,0.7)');
    oceanGrad.addColorStop(1,   'rgba(5,15,7,0.85)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = oceanGrad;
    ctx.fill();

    // ── Project + collect dots ──
    type Projected = {
      sx: number; sy: number; depth: number;
      dot: GlobeDot; visible: boolean;
    };
    const projected: Projected[] = [];

    for (const dot of s.dots) {
      // 1) Y-axis rotation (spin)
      const x1 =  dot.x * cosY + dot.z * sinY;
      const z1 = -dot.x * sinY + dot.z * cosY;
      // 2) X-axis rotation (tilt)
      const y2 =  dot.y * cosX - z1 * sinX;
      const z2 =  dot.y * sinX + z1 * cosX;

      // Perspective
      const depth = (z2 + 1) / 2;   // 0 = back, 1 = front
      const scale = fov / (fov + 1 - depth * 0.6);

      projected.push({
        sx: cx + x1 * R * scale,
        sy: cy - y2 * R * scale,
        depth,
        dot,
        visible: z2 > -0.12,   // slight bleed past edge
      });
    }

    // ── Sort back-to-front ──
    projected.sort((a, b) => a.depth - b.depth);

    // ── Draw grid lines (latitude / longitude) ──
    if (!isMobile) {
      ctx.save();
      ctx.globalAlpha = 0.06;
      ctx.strokeStyle = '#66BB6A';
      ctx.lineWidth   = 0.5;

      // Draw 6 latitude circles
      for (let latDeg = -60; latDeg <= 60; latDeg += 30) {
        const latRad = latDeg * Math.PI / 180;
        const ry     = Math.sin(latRad);
        const rr     = Math.cos(latRad);
        ctx.beginPath();
        for (let lon = 0; lon <= 360; lon += 2) {
          const lonRad = lon * Math.PI / 180;
          const dx  = rr * Math.cos(lonRad);
          const dz  = rr * Math.sin(lonRad);
          // rotate
          const rx1 =  dx * cosY + dz * sinY;
          const rz1 = -dx * sinY + dz * cosY;
          const ry2 =  ry * cosX - rz1 * sinX;
          const rz2 =  ry * sinX + rz1 * cosX;
          if (rz2 < -0.05) continue;
          const sc  = fov / (fov + 1 - ((rz2 + 1) / 2) * 0.6);
          const px  = cx + rx1 * R * sc;
          const py  = cy - ry2 * R * sc;
          if (lon === 0) ctx.moveTo(px, py);
          else           ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      // Draw 6 longitude arcs
      for (let lonDeg = 0; lonDeg < 180; lonDeg += 30) {
        const lonRad = lonDeg * Math.PI / 180;
        ctx.beginPath();
        for (let lat = -90; lat <= 90; lat += 2) {
          const latRad = lat * Math.PI / 180;
          const dx  = Math.cos(latRad) * Math.cos(lonRad);
          const dz  = Math.cos(latRad) * Math.sin(lonRad);
          const dy  = Math.sin(latRad);
          const rx1 =  dx * cosY + dz * sinY;
          const rz1 = -dx * sinY + dz * cosY;
          const ry2 =  dy * cosX - rz1 * sinX;
          const rz2 =  dy * sinX + rz1 * cosX;
          if (rz2 < -0.05) continue;
          const sc  = fov / (fov + 1 - ((rz2 + 1) / 2) * 0.6);
          const px  = cx + rx1 * R * sc;
          const py  = cy - ry2 * R * sc;
          if (lat === -90) ctx.moveTo(px, py);
          else             ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.restore();
    }

    // ── Draw dots ──
    let skipCount = 0;
    for (const p of projected) {
      if (!p.visible) continue;

      if (isMobile) {
        skipCount++;
        if (skipCount % 2 === 0) continue;
      }

      const { depth, dot } = p;
      // Depth-based fade: back hemisphere is darker
      const depthFade = depth * depth; // quadratic for dramatic contrast
      const radius    = dot.size * (0.4 + depth * 0.7) * (dot.isLand ? 1.3 : 0.85);

      let r: number, g: number, b: number, alpha: number;

      if (dot.isLand) {
        // Land — vivid green, brighter near front
        const sparkle = 0.85 + 0.15 * Math.sin(s.pulse * 2 + dot.brightness * 8);
        r = Math.floor(65  + depthFade * 100 * sparkle);
        g = Math.floor(130 + depthFade * 85  * sparkle);
        b = Math.floor(65  + depthFade * 50  * sparkle);
        alpha = 0.25 + depthFade * 0.75;
      } else {
        // Ocean — very subtle blue-green dots
        r = Math.floor(15 + depthFade * 35);
        g = Math.floor(50 + depthFade * 70);
        b = Math.floor(45 + depthFade * 60);
        alpha = 0.08 + depthFade * 0.22;
      }

      ctx.beginPath();
      ctx.arc(p.sx, p.sy, Math.max(0.3, radius), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.globalAlpha = 1;
      ctx.fill();
    }

    // ── Specular highlight (white sheen top-left) ──
    const specGrad = ctx.createRadialGradient(
      cx - R * 0.38, cy - R * 0.38, 0,
      cx - R * 0.38, cy - R * 0.38, R * 0.55,
    );
    specGrad.addColorStop(0, 'rgba(165,214,167,0.18)');
    specGrad.addColorStop(1, 'rgba(165,214,167,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();

    // ── Edge vignette (darkens limb of globe) ──
    const limbGrad = ctx.createRadialGradient(cx, cy, R * 0.7, cx, cy, R);
    limbGrad.addColorStop(0, 'rgba(0,0,0,0)');
    limbGrad.addColorStop(1, 'rgba(3,9,4,0.85)');
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = limbGrad;
    ctx.fill();

    s.rafId = requestAnimationFrame(draw);
  }, []);

  // ─── Setup effect ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w   = canvas.offsetWidth;
      const h   = canvas.offsetHeight;
      canvas.width  = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      const ctx2 = canvas.getContext('2d');
      if (ctx2) ctx2.scale(dpr, dpr);
      // Store logical size in dataset for draw loop
      canvas.dataset.logW = String(w);
      canvas.dataset.logH = String(h);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // Mouse / touch drag
    const onDown = (e: MouseEvent | TouchEvent) => {
      s.isDragging = true;
      const pt = 'touches' in e ? e.touches[0] : e;
      s.lastMX = pt.clientX;
      s.lastMY = pt.clientY;
    };
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!s.isDragging) return;
      const pt = 'touches' in e ? e.touches[0] : e;
      const dx = pt.clientX - s.lastMX;
      const dy = pt.clientY - s.lastMY;
      s.lastMX = pt.clientX;
      s.lastMY = pt.clientY;
      s.rotY  += dx * 0.006;
      s.rotX  += dy * 0.006;
      s.rotX   = Math.max(-0.7, Math.min(0.7, s.rotX));
    };
    const onUp = () => { s.isDragging = false; };

    canvas.addEventListener('mousedown',  onDown);
    canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('touchmove',  onMove, { passive: true });
    window.addEventListener('mouseup',    onUp);
    window.addEventListener('touchend',   onUp);

    s.lastTime = 0;
    s.rafId    = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(s.rafId);
      ro.disconnect();
      canvas.removeEventListener('mousedown',  onDown);
      canvas.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('touchmove',  onMove);
      window.removeEventListener('mouseup',    onUp);
      window.removeEventListener('touchend',   onUp);
    };
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Rotating Earth globe"
      className="earth-globe-canvas"
      style={{
        display:   'block',
        width:     '100%',
        height:    '100%',
        cursor:    'grab',
      }}
    />
  );
}
