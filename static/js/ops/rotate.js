/**
 * Görüntüyü Nearest Neighbor (En Yakın Komşuluk) yöntemiyle döndürür.
 * Kurallara uygun: Hazır kütüphane yok, tamamen döngü ve matematik.
 */
export function applyRotate(imageData, angleDeg) {
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);
  
  // Dereceyi radyana çevir
  const angleRad = (angleDeg * Math.PI) / 180.0;
  const cosA = Math.cos(angleRad);
  const sinA = Math.sin(angleRad);

  // Dönme merkezi (Resmin ortası)
  const cx = width / 2.0;
  const cy = height / 2.0;

  for (let yOut = 0; yOut < height; yOut++) {
    for (let xOut = 0; xOut < width; xOut++) {
      // Çıkış koordinatlarını merkeze göre ötele
      const xShift = xOut - cx;
      const yShift = yOut - cy;

      // Ters dönüşüm formülü (Inverse Mapping)
      // Python kodundaki mantığın aynısı:
      const xSrc = cosA * xShift + sinA * yShift + cx;
      const ySrc = -sinA * xShift + cosA * yShift + cy;

      // En yakın pikseli bul (Rounding)
      const xs = Math.round(xSrc);
      const ys = Math.round(ySrc);

      const outIdx = (yOut * width + xOut) * 4;

      // Sınır kontrolü
      if (xs >= 0 && xs < width && ys >= 0 && ys < height) {
        const srcIdx = (ys * width + xs) * 4;
        
        // Piksel verilerini kopyala (RGBA)
        out.data[outIdx] = data[srcIdx];         // R
        out.data[outIdx + 1] = data[srcIdx + 1]; // G
        out.data[outIdx + 2] = data[srcIdx + 2]; // B
        out.data[outIdx + 3] = data[srcIdx + 3]; // A
      } else {
        // Resim sınırları dışında kalan yerleri siyah/şeffaf yap
        out.data[outIdx] = 0;
        out.data[outIdx + 1] = 0;
        out.data[outIdx + 2] = 0;
        out.data[outIdx + 3] = 255; // Arka plan siyah olsun
      }
    }
  }

  return out;
}