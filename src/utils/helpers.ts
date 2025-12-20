export const noop = () => {};

export const formatCurrency = (v: number) => `£${v.toFixed(2)}`;

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = String(hex ?? '').trim();
  if (!h.startsWith('#')) {
    return null;
  }
  const raw = h.slice(1);
  if (raw.length === 3) {
    const r = parseInt(raw[0] + raw[0], 16);
    const g = parseInt(raw[1] + raw[1], 16);
    const b = parseInt(raw[2] + raw[2], 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) {
      return null;
    }
    return { r, g, b };
  }
  if (raw.length === 6) {
    const r = parseInt(raw.slice(0, 2), 16);
    const g = parseInt(raw.slice(2, 4), 16);
    const b = parseInt(raw.slice(4, 6), 16);
    if ([r, g, b].some((x) => Number.isNaN(x))) {
      return null;
    }
    return { r, g, b };
  }
  return null;
}

// WCAG-ish relative luminance for deciding readable text color (black/white).
function relativeLuminance(rgb: { r: number; g: number; b: number }) {
  const srgb = [rgb.r, rgb.g, rgb.b].map((v) => v / 255);
  const linear = srgb.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}

/**
 * Return a readable text color (black/white) for a given background color.
 * Accepts hex like "#RRGGBB" or "#RGB". Falls back to `lightText` if parsing fails.
 */
export function getReadableTextColor(
  backgroundHex: string,
  lightText: string = '#FFFFFF',
  darkText: string = '#000000',
) {
  const rgb = hexToRgb(backgroundHex);
  if (!rgb) {
    return lightText;
  }
  const L = clamp01(relativeLuminance(rgb));
  // Simple threshold works well for our palette.
  return L > 0.6 ? darkText : lightText;
}
