import { applyGrayscale } from "./grayscale.js";
import { applyBinary } from "./binary.js";
import { applyRotate } from "./rotate.js";
import { applyCrop } from "./crop.js";
import { applyResize } from "./resize.js";
import { applyRgbToHsv } from "./colorspace.js";
import { applyHistogramStretch, computeHistogram, drawHistogram } from "./histogram.js";
import { applyAdd, applyDivide } from "./arithmetic.js";
import { applyContrast } from "./contrast.js";
import { applyMeanFilter } from "./convolution.js";

export const operationRegistry = {
  grayscale: applyGrayscale,
  binary: applyBinary,
  rotate: applyRotate,
  crop: applyCrop,
  resize: applyResize,
  rgbToHsv: applyRgbToHsv,
  histogramStretch: applyHistogramStretch,
  computeHistogram: computeHistogram,
  drawHistogram: drawHistogram,
  addImages: applyAdd,
  divideImages: applyDivide,
  contrast: applyContrast,
  meanFilter: applyMeanFilter,
};
