/**
 * Goruntuyu manuel olarak kirpar.
 * Hazir resize/warp/crop fonksiyonu kullanilmaz, piksel kopyalama ile yapilir.
 */
export function applyCrop(imageData, x, y, cropWidth, cropHeight) {
  const srcW = imageData.width;
  const srcH = imageData.height;
  const src = imageData.data;

  const startX = Math.max(0, Math.min(srcW - 1, Math.floor(x)));
  const startY = Math.max(0, Math.min(srcH - 1, Math.floor(y)));
  const outW = Math.max(1, Math.min(Math.floor(cropWidth), srcW - startX));
  const outH = Math.max(1, Math.min(Math.floor(cropHeight), srcH - startY));

  const out = new ImageData(outW, outH);

  for (let yy = 0; yy < outH; yy++) {
    for (let xx = 0; xx < outW; xx++) {
      const srcX = startX + xx;
      const srcY = startY + yy;

      const srcIdx = (srcY * srcW + srcX) * 4;
      const outIdx = (yy * outW + xx) * 4;

      out.data[outIdx] = src[srcIdx];
      out.data[outIdx + 1] = src[srcIdx + 1];
      out.data[outIdx + 2] = src[srcIdx + 2];
      out.data[outIdx + 3] = src[srcIdx + 3];
    }
  }

  return out;
}
