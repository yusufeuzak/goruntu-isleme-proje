/**
 * Görüntü Yaklaştırma / Uzaklaştırma (Nearest Neighbor Interpolation)
 * Hazır resize fonksiyonu kullanılmaz — piksel kopyalama ile yapılır.
 */
export function applyResize(imageData, scale) {
  const srcW = imageData.width;
  const srcH = imageData.height;
  const src = imageData.data;

  if (scale <= 0) {
    return imageData;
  }

  const newW = Math.max(1, Math.round(srcW * scale));
  const newH = Math.max(1, Math.round(srcH * scale));

  const out = new ImageData(newW, newH);

  for (let y = 0; y < newH; y++) {
    for (let x = 0; x < newW; x++) {
      // Ters eşleme: çıkış pikselinin kaynaktaki karşılığını bul
      const srcX = Math.min(srcW - 1, Math.round(x / scale));
      const srcY = Math.min(srcH - 1, Math.round(y / scale));

      const srcIdx = (srcY * srcW + srcX) * 4;
      const outIdx = (y * newW + x) * 4;

      out.data[outIdx] = src[srcIdx];         // R
      out.data[outIdx + 1] = src[srcIdx + 1]; // G
      out.data[outIdx + 2] = src[srcIdx + 2]; // B
      out.data[outIdx + 3] = src[srcIdx + 3]; // A
    }
  }

  return out;
}
