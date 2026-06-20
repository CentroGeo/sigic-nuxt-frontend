export function hexARgb(hex) {
  if (!hex || typeof hex !== 'string') return null;
  let h = hex.replace('#', '').trim();
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  if (h.length !== 6) return null;
  const num = parseInt(h, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function luminanciaRelativa(hex) {
  const rgb = hexARgb(hex);
  if (!rgb) return 1;
  const transformar = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * transformar(rgb.r) + 0.7152 * transformar(rgb.g) + 0.0722 * transformar(rgb.b);
}

export function colorContraste(hex) {
  return luminanciaRelativa(hex) > 0.5 ? '#000000' : '#ffffff';
}
