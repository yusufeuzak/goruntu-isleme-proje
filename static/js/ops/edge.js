import { applyGrayscale } from "./grayscale.js";

/**
 * Kenar Bulma — Prewitt Operatoru (Manuel)
 * Hazir filter2D / Sobel / Prewitt fonksiyonu KULLANILMAZ.
 * Once gri tonlamaya cevrilir, sonra Gx ve Gy cekirdekleri uygulanir.
 *
 * Gx = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]]
 * Gy = [[ 1, 1, 1], [ 0, 0, 0], [-1,-1,-1]]
 *
 * Kenar siddeti: G = sqrt(Gx^2 + Gy^2)
 */
export function applyPrewitt(imageData) {
  const grayData = applyGrayscale(imageData);
  const { width, height, data } = grayData;

  const gxKernel = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1],
  ];
  const gyKernel = [
    [1, 1, 1],
    [0, 0, 0],
    [-1, -1, -1],
  ];

  const out = new ImageData(width, height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let gx = 0;
      let gy = 0;

      for (let ky = 0; ky < 3; ky++) {
        for (let kx = 0; kx < 3; kx++) {
          const srcY = y + ky - 1;
          const srcX = x + kx - 1;

          let pixelVal = 0;
          if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
            const srcIdx = (srcY * width + srcX) * 4;
            pixelVal = data[srcIdx];
          }

          gx += pixelVal * gxKernel[ky][kx];
          gy += pixelVal * gyKernel[ky][kx];
        }
      }

      const mag = Math.min(255, Math.round(Math.sqrt(gx * gx + gy * gy)));
      const outIdx = (y * width + x) * 4;
      out.data[outIdx] = mag;
      out.data[outIdx + 1] = mag;
      out.data[outIdx + 2] = mag;
      out.data[outIdx + 3] = 255;
    }
  }

  return out;
}
