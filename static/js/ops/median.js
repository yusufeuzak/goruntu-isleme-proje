/**
 * Median Filtre (Manuel)
 * Hazir medianBlur / cv2.medianBlur KULLANILMAZ.
 * Her piksel icin ksize x ksize komsulukta bulunan degerler siralanir
 * ve ortanca (median) deger cikis pikseli olur.
 * Salt & Pepper gurultusu temizlemek icin idealdir.
 *
 * @param {ImageData} imageData — giris gorseli
 * @param {number} ksize — pencere boyutu (3, 5, 7 vb.)
 * @returns {ImageData} — filtrelenmis gorsel
 */
export function applyMedianFilter(imageData, ksize = 3) {
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);
  const pad = Math.floor(ksize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Her kanal (R, G, B) icin ayri ayri median hesapla
      for (let ch = 0; ch < 3; ch++) {
        const values = [];

        for (let ky = 0; ky < ksize; ky++) {
          for (let kx = 0; kx < ksize; kx++) {
            const srcY = y + ky - pad;
            const srcX = x + kx - pad;

            if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
              const srcIdx = (srcY * width + srcX) * 4;
              values.push(data[srcIdx + ch]);
            } else {
              values.push(0); // zero-padding
            }
          }
        }

        values.sort((a, b) => a - b);
        const median = values[Math.floor(values.length / 2)];

        const outIdx = (y * width + x) * 4;
        out.data[outIdx + ch] = median;
      }

      const outIdx = (y * width + x) * 4;
      out.data[outIdx + 3] = 255;
    }
  }

  return out;
}
