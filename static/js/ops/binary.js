import { applyGrayscale } from "./grayscale.js";

export function applyBinary(imageData, threshold = 128) {
  const grayImage = applyGrayscale(imageData);
  const out = new ImageData(grayImage.width, grayImage.height);

  for (let i = 0; i < grayImage.data.length; i += 4) {
    const value = grayImage.data[i] >= threshold ? 255 : 0;
    out.data[i] = value;
    out.data[i + 1] = value;
    out.data[i + 2] = value;
    out.data[i + 3] = 255;
  }

  return out;
}
