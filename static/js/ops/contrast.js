/**
 * Kontrast Artırma (Manuel)
 * Hazır fonksiyon kullanılmaz — piksel seviyesinde döngü ile yapılır.
 *
 * Formül: out = 128 + factor * (pixel - 128)
 * factor > 1 → kontrast artırır
 * factor < 1 → kontrast azaltır
 * factor = 1 → değişiklik yok
 */
export function applyContrast(imageData, factor) {
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      const val = 128 + factor * (data[i + ch] - 128);
      out.data[i + ch] = Math.max(0, Math.min(255, Math.round(val)));
    }
    out.data[i + 3] = 255; // Alpha
  }

  return out;
}
