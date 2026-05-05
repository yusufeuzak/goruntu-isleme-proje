/**
 * Renk Uzayı Dönüşümü: RGB → HSV (Manuel)
 * Hazır cvtColor / rgb2hsv gibi fonksiyonlar KULLANILMAZ.
 * Her piksel için R,G,B değerlerinden H,S,V hesaplanır.
 * Çıkış: HSV değerleri görselleştirilmiş (H→R, S→G, V→B kanallarına eşlenir)
 */
export function applyRgbToHsv(imageData) {
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);

  for (let i = 0; i < data.length; i += 4) {
    // 0-255 aralığını 0-1 aralığına normalize et
    const r = data[i] / 255.0;
    const g = data[i + 1] / 255.0;
    const b = data[i + 2] / 255.0;

    const cMax = Math.max(r, g, b);
    const cMin = Math.min(r, g, b);
    const delta = cMax - cMin;

    // Hue hesaplama (derece cinsinden)
    let hDeg = 0;
    if (delta === 0) {
      hDeg = 0;
    } else if (cMax === r) {
      hDeg = 60.0 * (((g - b) / delta) % 6);
    } else if (cMax === g) {
      hDeg = 60.0 * (((b - r) / delta) + 2);
    } else {
      hDeg = 60.0 * (((r - g) / delta) + 4);
    }

    // Negatif hue düzeltmesi
    if (hDeg < 0) {
      hDeg += 360;
    }

    // Saturation hesaplama
    const s = cMax === 0 ? 0 : delta / cMax;

    // Value
    const v = cMax;

    // HSV değerlerini 0-255 aralığına eşle (görselleştirme için)
    // H: 0-360 → 0-179 (OpenCV standardı) → sonra 0-255 aralığına ölçekle
    out.data[i] = Math.round((hDeg / 360.0) * 255);     // H → R kanalı
    out.data[i + 1] = Math.round(s * 255);               // S → G kanalı
    out.data[i + 2] = Math.round(v * 255);               // V → B kanalı
    out.data[i + 3] = 255;                                // Alpha
  }

  return out;
}
