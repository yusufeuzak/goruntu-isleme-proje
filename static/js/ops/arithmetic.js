/**
 * Aritmetik işlemler: toplama (iki görsel), bölme (sabit sayı ile)
 * Hazır fonksiyon kullanılmaz — piksel seviyesinde döngülerle yapılır.
 */

/**
 * İkinci görseli birinci görselin boyutuna nearest neighbor ile yeniden boyutlandır.
 * resize kütüphanesi kullanılmaz.
 */
function resizeToMatch(srcData, targetW, targetH) {
  const srcW = srcData.width;
  const srcH = srcData.height;
  const src = srcData.data;

  const out = new ImageData(targetW, targetH);

  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcX = Math.min(srcW - 1, Math.floor((x * srcW) / targetW));
      const srcY = Math.min(srcH - 1, Math.floor((y * srcH) / targetH));

      const srcIdx = (srcY * srcW + srcX) * 4;
      const outIdx = (y * targetW + x) * 4;

      out.data[outIdx] = src[srcIdx];
      out.data[outIdx + 1] = src[srcIdx + 1];
      out.data[outIdx + 2] = src[srcIdx + 2];
      out.data[outIdx + 3] = src[srcIdx + 3];
    }
  }

  return out;
}

/**
 * İki görsel toplama: result = min(255, img1 + img2)
 * Boyutlar farklıysa img2, img1 boyutuna getirilir.
 */
export function applyAdd(imageData1, imageData2) {
  const w = imageData1.width;
  const h = imageData1.height;
  const src1 = imageData1.data;

  // İkinci görseli aynı boyuta getir
  let matched = imageData2;
  if (imageData2.width !== w || imageData2.height !== h) {
    matched = resizeToMatch(imageData2, w, h);
  }
  const src2 = matched.data;

  const out = new ImageData(w, h);

  for (let i = 0; i < src1.length; i += 4) {
    out.data[i] = Math.min(255, src1[i] + src2[i]);             // R
    out.data[i + 1] = Math.min(255, src1[i + 1] + src2[i + 1]); // G
    out.data[i + 2] = Math.min(255, src1[i + 2] + src2[i + 2]); // B
    out.data[i + 3] = 255;                                       // A
  }

  return out;
}

/**
 * Sabit sayı ile bölme: result[ch] = clamp(round(pixel[ch] / scalar), 0, 255)
 * Bölen < 1 olamaz; karartma efekti üretir (scalar=2 yarı parlaklık).
 */
export function applyDivideByScalar(imageData, scalar) {
  const w = imageData.width;
  const h = imageData.height;
  const src = imageData.data;

  const divisor = Math.max(1, Number(scalar) || 1);

  const out = new ImageData(w, h);

  for (let i = 0; i < src.length; i += 4) {
    out.data[i]     = Math.min(255, Math.max(0, Math.round(src[i]     / divisor))); // R
    out.data[i + 1] = Math.min(255, Math.max(0, Math.round(src[i + 1] / divisor))); // G
    out.data[i + 2] = Math.min(255, Math.max(0, Math.round(src[i + 2] / divisor))); // B
    out.data[i + 3] = 255;                                                          // A
  }

  return out;
}
