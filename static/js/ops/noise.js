/**
 * Salt & Pepper Gurultu Ekleme (Manuel)
 * Hazir gurultu fonksiyonu KULLANILMAZ.
 * Toplam piksel sayisinin "amount" oraninda kismina rastgele 0 (pepper)
 * veya 255 (salt) degeri atanir.
 *
 * @param {ImageData} imageData — giris gorseli
 * @param {number} amount — gurultu orani (0.01 - 0.30)
 * @returns {ImageData} — gurultu eklenmis gorsel
 */
export function applySaltPepperNoise(imageData, amount = 0.05) {
  const { width, height, data } = imageData;
  const out = new ImageData(width, height);

  // Once orijinal gorseli kopyala
  for (let i = 0; i < data.length; i++) {
    out.data[i] = data[i];
  }

  const totalPixels = width * height;
  const noisyPixels = Math.floor(totalPixels * amount);

  for (let i = 0; i < noisyPixels; i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    const idx = (y * width + x) * 4;

    // Yari yariya tuz (255) ve biber (0)
    const value = Math.random() < 0.5 ? 0 : 255;
    out.data[idx] = value;
    out.data[idx + 1] = value;
    out.data[idx + 2] = value;
    out.data[idx + 3] = 255;
  }

  return out;
}
