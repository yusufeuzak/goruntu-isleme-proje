/**
 * Konvolüsyon İşlemi — Mean (Ortalama) Filtre
 * Hazır filter2D, blur, GaussianBlur vb. KULLANILMAZ.
 * Tüm konvolüsyon döngülerle ve zero-padding ile sıfırdan yapılır.
 */

/**
 * Genel amaçlı manuel konvolüsyon.
 * Görüntüye verilen kernel (çekirdek) matrisi uygulanır.
 * Zero-padding ile sınır pikselleri işlenir.
 *
 * @param {ImageData} imageData — giriş görseli
 * @param {number[][]} kernel — 2D çekirdek matrisi (örn. 3x3)
 * @returns {ImageData} — konvolüsyon uygulanmış görsel
 */
export function convolveManual(imageData, kernel) {
  const { width, height, data } = imageData;
  const kH = kernel.length;
  const kW = kernel[0].length;
  const padY = Math.floor(kH / 2);
  const padX = Math.floor(kW / 2);

  const out = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Her kanal (R, G, B) için ayrı ayrı konvolüsyon
      for (let ch = 0; ch < 3; ch++) {
        let acc = 0.0;

        for (let ky = 0; ky < kH; ky++) {
          for (let kx = 0; kx < kW; kx++) {
            // Kaynak piksel koordinatları (zero-padding)
            const srcY = y + ky - padY;
            const srcX = x + kx - padX;

            let pixelVal = 0; // padding → sıfır
            if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
              const srcIdx = (srcY * width + srcX) * 4;
              pixelVal = data[srcIdx + ch];
            }

            acc += pixelVal * kernel[ky][kx];
          }
        }

        const outIdx = (y * width + x) * 4;
        out.data[outIdx + ch] = Math.max(0, Math.min(255, Math.round(acc)));
      }

      // Alpha kanalı
      const outIdx = (y * width + x) * 4;
      out.data[outIdx + 3] = 255;
    }
  }

  return out;
}

/**
 * Mean (Ortalama) Filtre.
 * ksize x ksize boyutunda tüm elemanları 1/(ksize*ksize) olan kernel kullanır.
 *
 * @param {ImageData} imageData — giriş görseli
 * @param {number} ksize — çekirdek boyutu (3, 5, 7 vb.)
 * @returns {ImageData} — filtrelenmiş görsel
 */
export function applyMeanFilter(imageData, ksize = 3) {
  // ksize x ksize kernel oluştur, her eleman = 1 / (ksize * ksize)
  const val = 1.0 / (ksize * ksize);
  const kernel = [];
  for (let i = 0; i < ksize; i++) {
    const row = [];
    for (let j = 0; j < ksize; j++) {
      row.push(val);
    }
    kernel.push(row);
  }

  return convolveManual(imageData, kernel);
}
