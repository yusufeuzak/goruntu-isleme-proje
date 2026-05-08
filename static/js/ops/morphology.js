import { applyBinary } from "./binary.js";

/**
 * Morfolojik Islemler — Asinma, Genisleme, Acma, Kapama (Manuel)
 * Hazir erode / dilate / morphologyEx KULLANILMAZ.
 *
 * Once gorsel ikili (binary) hale getirilir (esik 127), ardindan
 * ksize x ksize yapisal eleman ile islem uygulanir.
 *
 * Asinma (Erode): Pencerenin tum elemanlari beyaz ise piksel beyaz kalir.
 * Genisleme (Dilate): Pencerede en az bir beyaz piksel varsa piksel beyaz olur.
 * Acma (Opening): Once asinma, sonra genisleme. Kucuk gurultuleri temizler.
 * Kapama (Closing): Once genisleme, sonra asinma. Kucuk delikleri kapatir.
 */

function erodeOnBinary(binaryData, ksize) {
  const { width, height, data } = binaryData;
  const out = new ImageData(width, height);
  const pad = Math.floor(ksize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let allWhite = true;

      for (let ky = -pad; ky <= pad && allWhite; ky++) {
        for (let kx = -pad; kx <= pad && allWhite; kx++) {
          const yy = y + ky;
          const xx = x + kx;

          if (yy < 0 || yy >= height || xx < 0 || xx >= width) {
            allWhite = false;
          } else {
            const idx = (yy * width + xx) * 4;
            if (data[idx] === 0) {
              allWhite = false;
            }
          }
        }
      }

      const outIdx = (y * width + x) * 4;
      const val = allWhite ? 255 : 0;
      out.data[outIdx] = val;
      out.data[outIdx + 1] = val;
      out.data[outIdx + 2] = val;
      out.data[outIdx + 3] = 255;
    }
  }

  return out;
}

function dilateOnBinary(binaryData, ksize) {
  const { width, height, data } = binaryData;
  const out = new ImageData(width, height);
  const pad = Math.floor(ksize / 2);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let anyWhite = false;

      for (let ky = -pad; ky <= pad && !anyWhite; ky++) {
        for (let kx = -pad; kx <= pad && !anyWhite; kx++) {
          const yy = y + ky;
          const xx = x + kx;

          if (yy >= 0 && yy < height && xx >= 0 && xx < width) {
            const idx = (yy * width + xx) * 4;
            if (data[idx] > 0) {
              anyWhite = true;
            }
          }
        }
      }

      const outIdx = (y * width + x) * 4;
      const val = anyWhite ? 255 : 0;
      out.data[outIdx] = val;
      out.data[outIdx + 1] = val;
      out.data[outIdx + 2] = val;
      out.data[outIdx + 3] = 255;
    }
  }

  return out;
}

export function applyErode(imageData, ksize = 3) {
  const binary = applyBinary(imageData, 127);
  return erodeOnBinary(binary, ksize);
}

export function applyDilate(imageData, ksize = 3) {
  const binary = applyBinary(imageData, 127);
  return dilateOnBinary(binary, ksize);
}

export function applyOpening(imageData, ksize = 3) {
  const binary = applyBinary(imageData, 127);
  const eroded = erodeOnBinary(binary, ksize);
  return dilateOnBinary(eroded, ksize);
}

export function applyClosing(imageData, ksize = 3) {
  const binary = applyBinary(imageData, 127);
  const dilated = dilateOnBinary(binary, ksize);
  return erodeOnBinary(dilated, ksize);
}
