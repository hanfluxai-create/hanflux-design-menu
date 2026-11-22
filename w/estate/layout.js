// Ruvela Residences: the township layout, shared by the 3D scene and the 2D site plan.
// The site is 50 x 35 units (155 x 108 m), which is the 4.2 acres quoted in the copy.
// Units: 1 unit is one storey (about 3.1 m). x points east, z points south, y is up.

export const FLOOR = 1;        // storey height
export const PODIUM = 1.2;     // landscaped podium deck over the car park
export const LOBBY = 2;        // double-height entrance lobby under each tower

export const SITE = { x0: -25, x1: 25, z0: -17.5, z1: 17.5, r: 5.5 };

export const TOWERS = [
  { id: 'A', x: -15.2, z: -8.2, yaw: 0.17, w: 9, d: 6, floors: 20 },
  { id: 'B', x: 0, z: -10.6, yaw: 0, w: 9, d: 6, floors: 24 },
  { id: 'C', x: 15.2, z: -7.4, yaw: -0.17, w: 9, d: 6, floors: 22 }
];

// The home the camera flies to: Tower A (the westernmost, open view), floor 14, the west-facing 3 BHK.
export const HOME = { tower: 0, floor: 14 };
export const floorY = (k) => PODIUM + LOBBY + (k - 1) * FLOOR;

export const CLUB = { x: 13.6, z: 9.4, w: 10.4, d: 6.2, yaw: -0.08 };
export const POOL = { x: -4.6, z: 9.2, w: 9.6, d: 2.7 };
export const KIDS_POOL = { x: 2.2, z: 10.2, w: 2.6, d: 2.2 };
export const DECK = { x: -4.6, z: 11.6, w: 12.6, d: 2.0 };
export const LAWNS = [
  { x: -1.2, z: 1.2, rx: 13.2, rz: 4.3, rot: -0.04 },
  { x: -17.2, z: 5.4, rx: 5.2, rz: 4.6, rot: 0.3 },
  { x: 18.8, z: 1.4, rx: 4.6, rz: 3.4, rot: -0.2 }
];
export const PLAY = { x: -17.4, z: 5.6 };
export const TRACK = { inset: 1.35, width: 0.85 };
export const GATE = { x: 21.5, z: 17.5 };
export const ROAD_Z = 23.5;       // Baner road runs east to west, south of the site
export const ROAD_X = 31;         // a lane runs north to south, east of the site

// Small seeded random so the 3D trees and the site plan trees agree.
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// World point to a rotated rect's local frame (same convention as three.js rotation.y).
export function toLocal(x, z, cx, cz, yaw) {
  const c = Math.cos(yaw), s = Math.sin(yaw), dx = x - cx, dz = z - cz;
  return [dx * c - dz * s, dx * s + dz * c];
}
function inRect(x, z, cx, cz, hw, hd, yaw, pad) {
  const [lx, lz] = toLocal(x, z, cx, cz, yaw);
  return Math.abs(lx) < hw + pad && Math.abs(lz) < hd + pad;
}

export function blocked(x, z, pad = 1.2) {
  for (const t of TOWERS) if (inRect(x, z, t.x, t.z, t.w / 2, t.d / 2, t.yaw, pad + 1.2)) return true;
  if (inRect(x, z, CLUB.x, CLUB.z, CLUB.w / 2, CLUB.d / 2, CLUB.yaw, pad)) return true;
  if (inRect(x, z, POOL.x, POOL.z, POOL.w / 2, POOL.d / 2, 0, pad)) return true;
  if (inRect(x, z, DECK.x, DECK.z, DECK.w / 2, DECK.d / 2, 0, pad * 0.5)) return true;
  if (inRect(x, z, KIDS_POOL.x, KIDS_POOL.z, KIDS_POOL.w / 2, KIDS_POOL.d / 2, 0, pad)) return true;
  if (Math.hypot(x - PLAY.x, z - PLAY.z) < 2.6) return true;
  if (Math.hypot(x - GATE.x, z - GATE.z) < 4) return true;
  return false;
}

// Rounded-rectangle outline of the podium, as points (used for the jogging loop and the edge).
export function roundRect(x0, z0, x1, z1, r, seg = 6) {
  const pts = [];
  const corner = (cx, cz, a0) => { for (let i = 0; i <= seg; i++) { const a = a0 + (i / seg) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cz + Math.sin(a) * r]); } };
  corner(x1 - r, z1 - r, 0);
  corner(x0 + r, z1 - r, Math.PI / 2);
  corner(x0 + r, z0 + r, Math.PI);
  corner(x1 - r, z0 + r, Math.PI * 1.5);
  return pts;
}

// Trees on the podium: a ring inside the jogging loop, plus clusters on the lawns.
// kind 0: rain tree green, 1: gulmohar (flame orange), 2: amaltas (gold)
export function siteTrees() {
  const R = rng(1403), out = [];
  const ring = roundRect(SITE.x0 + 3.3, SITE.z0 + 3.3, SITE.x1 - 3.3, SITE.z1 - 3.3, SITE.r - 2.4, 5);
  // walk the ring at an even spacing
  let acc = 0;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length];
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    while (acc < L) {
      const t = acc / L, x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t;
      // the south edge stays open in front of the pool deck, so the water reads from the road
      if (!blocked(x, z, 0.6) && !(z > 11 && x > -13.5 && x < 4.5)) out.push({ x, z, s: 0.85 + R() * 0.45, k: R() < 0.16 ? 1 : (R() < 0.12 ? 2 : 0) });
      acc += 2.7 + R() * 0.8;
    }
    acc -= L;
  }
  // lawn clusters
  for (const l of LAWNS) {
    const n = Math.round(l.rx * l.rz / 7);
    for (let i = 0; i < n; i++) {
      const ang = R() * Math.PI * 2, rr = Math.sqrt(R()) * 0.9;
      const x = l.x + Math.cos(ang) * l.rx * rr, z = l.z + Math.sin(ang) * l.rz * rr;
      if (Math.hypot((x - l.x) / l.rx, (z - l.z) / l.rz) < 0.42 && l === LAWNS[0]) continue; // keep the central lawn open
      if (!blocked(x, z, 0.9)) out.push({ x, z, s: 0.75 + R() * 0.5, k: R() < 0.2 ? 1 : (R() < 0.15 ? 2 : 0) });
    }
  }
  return out;
}

// Length of the jogging loop in metres (the copy quotes this number).
export function trackLength() {
  const i = TRACK.inset + TRACK.width / 2;
  const w = SITE.x1 - SITE.x0 - 2 * i, d = SITE.z1 - SITE.z0 - 2 * i, r = SITE.r - i;
  return (2 * (w + d) - 8 * r + 2 * Math.PI * r) * 3.1;
}
