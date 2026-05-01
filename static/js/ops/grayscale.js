export function applyGrayscale(imageData) {
  const out = new ImageData(imageData.width, imageData.height);
  for (let i = 0; i < imageData.data.length; i += 4) {
    const gray = Math.round(
      0.299 * imageData.data[i] +
      0.587 * imageData.data[i + 1] +
      0.114 * imageData.data[i + 2]
    );
    out.data[i] = gray;
    out.data[i + 1] = gray;
    out.data[i + 2] = gray;
    out.data[i + 3] = 255;
  }
  return out;
}
