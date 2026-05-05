import { applyGrayscale } from "./grayscale.js";

/**
 * Gri tonlama histogramı hesaplar (256 seviye).
 * Hazır equalizeHist vb. kullanılmaz — döngü ile sayılır.
 */
export function computeHistogram(imageData) {
  const grayData = applyGrayscale(imageData);
  const hist = new Array(256).fill(0);

  for (let i = 0; i < grayData.data.length; i += 4) {
    hist[grayData.data[i]] += 1;
  }

  return hist;
}

/**
 * Histogram Germe (Stretching) — Min-Max Normalizasyon.
 * Hazır fonksiyon kullanılmaz, döngü ve matematikle yapılır.
 *
 * Formül: out[i] = (pixel - min) * 255 / (max - min)
 */
export function applyHistogramStretch(imageData) {
  // Önce gri tonlamaya çevir
  const grayData = applyGrayscale(imageData);
  const { width, height } = grayData;
  const src = grayData.data;

  // Min ve max değerleri bul
  let minVal = 255;
  let maxVal = 0;

  for (let i = 0; i < src.length; i += 4) {
    const v = src[i];
    if (v < minVal) minVal = v;
    if (v > maxVal) maxVal = v;
  }

  // Germe uygula
  const out = new ImageData(width, height);

  if (maxVal === minVal) {
    // Tüm pikseller aynı değer — değişiklik yapma
    for (let i = 0; i < src.length; i += 4) {
      out.data[i] = src[i];
      out.data[i + 1] = src[i + 1];
      out.data[i + 2] = src[i + 2];
      out.data[i + 3] = 255;
    }
    return out;
  }

  const scale = 255.0 / (maxVal - minVal);

  for (let i = 0; i < src.length; i += 4) {
    const stretched = Math.round((src[i] - minVal) * scale);
    const clamped = Math.max(0, Math.min(255, stretched));
    out.data[i] = clamped;
    out.data[i + 1] = clamped;
    out.data[i + 2] = clamped;
    out.data[i + 3] = 255;
  }

  return out;
}

/**
 * Canvas üzerine histogram çizer.
 * @param {number[]} hist — 256 elemanlı histogram dizisi
 * @param {HTMLCanvasElement} canvas — çizim yapılacak canvas
 * @param {string} color — çubuk rengi
 */
export function drawHistogram(hist, canvas, color = "#3b82f6") {
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Arka plan
  ctx.fillStyle = "#1e1e2e";
  ctx.fillRect(0, 0, w, h);

  // Histogramdaki max değeri bul (ölçekleme için)
  let maxCount = 0;
  for (let i = 0; i < 256; i++) {
    if (hist[i] > maxCount) maxCount = hist[i];
  }

  if (maxCount === 0) return;

  const barWidth = w / 256;
  const padding = 4;

  ctx.fillStyle = color;
  for (let i = 0; i < 256; i++) {
    const barHeight = ((hist[i] / maxCount) * (h - padding * 2));
    const x = i * barWidth;
    const y = h - padding - barHeight;
    ctx.fillRect(x, y, Math.max(1, barWidth - 0.5), barHeight);
  }

  // Eksen çizgileri
  ctx.strokeStyle = "#666";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, h - padding);
  ctx.lineTo(w, h - padding);
  ctx.stroke();
}
