import { applyMeanFilter } from "./convolution.js";

/**
 * Unsharp Mask Filtresi (Manuel)
 * Hazir filter2D / Unsharp KULLANILMAZ.
 *
 * Adimlar:
 *   1) Gorsel mean filtresi ile bulaniklastirilir.
 *   2) Maske = Orijinal - Bulanik
 *   3) Cikis = Orijinal + amount * Maske
 *
 * Yuksek frekansli detaylar (kenarlar) belirginlesir.
 *
 * @param {ImageData} imageData — giris gorseli
 * @param {number} amount — keskinlestirme miktari (0.5 - 3.0)
 * @returns {ImageData} — keskinlestirilmis gorsel
 */
export function applyUnsharpMask(imageData, amount = 1.0) {
  const blurred = applyMeanFilter(imageData, 3);
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      const original = data[i + ch];
      const blur = blurred.data[i + ch];
      const mask = original - blur;
      const sharp = original + amount * mask;
      out.data[i + ch] = Math.max(0, Math.min(255, Math.round(sharp)));
    }
    out.data[i + 3] = 255;
  }

  return out;
}
