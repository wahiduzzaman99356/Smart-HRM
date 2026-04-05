/** Converts a hex color string to [h, s, l] (degrees, percent, percent). */
export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hslToHex(h: number, s: number, l: number): string {
  const hn = h / 360;
  const sn = s / 100;
  const ln = l / 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  let r: number, g: number, b: number;
  if (sn === 0) {
    r = g = b = ln;
  } else {
    const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
    const p = 2 * ln - q;
    r = hue2rgb(p, q, hn + 1 / 3);
    g = hue2rgb(p, q, hn);
    b = hue2rgb(p, q, hn - 1 / 3);
  }
  const toHex = (x: number) => Math.round(x * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export interface ColorScale {
  primary: string;
  dark: string;
  light: string;
}

/** Derives a dark and light variant of a primary hex color. */
export function deriveColorScale(primary: string): ColorScale {
  const [h, s, l] = hexToHsl(primary);
  return {
    primary,
    dark: hslToHex(h, Math.min(100, s + 5), Math.max(0, l - 12)),
    light: hslToHex(h, Math.max(0, s - 40), Math.min(100, l + 44)),
  };
}

/** Returns "r, g, b" string for use with rgba(var(--x), alpha) in CSS. */
export function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

export interface UIColorScale {
  border: string;
  borderSecondary: string;
  borderStrong: string;
  tableHeaderBg: string;
  tableHeaderSortBg: string;
  tableRowHoverBg: string;
  menuSubBg: string;
}

/**
 * Derives all light-mode UI surface/border colors from a primary hex.
 * Each value is a hue-tinted neutral — same hue as primary, very low saturation.
 */
export function deriveUIColors(primary: string): UIColorScale {
  const [h, s] = hexToHsl(primary);
  return {
    border:            hslToHex(h, Math.min(s, 22), 87),
    borderSecondary:   hslToHex(h, Math.min(s, 28), 83),
    borderStrong:      hslToHex(h, Math.min(s, 30), 78),
    tableHeaderBg:     hslToHex(h, Math.min(s, 25), 95),
    tableHeaderSortBg: hslToHex(h, Math.min(s, 33), 89),
    tableRowHoverBg:   hslToHex(h, Math.min(s, 18), 97),
    menuSubBg:         hslToHex(h, Math.min(s, 20), 96),
  };
}

/** Returns a hex color with adjusted alpha blended on white (approximate). */
export function alphaOnWhite(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const toHex = (x: number) => Math.round(x).toString(16).padStart(2, '0');
  return `#${toHex(r * alpha + 255 * (1 - alpha))}${toHex(g * alpha + 255 * (1 - alpha))}${toHex(b * alpha + 255 * (1 - alpha))}`;
}
