import { applyGrayscale } from "./grayscale.js";
import { applyBinary } from "./binary.js";
import { applyRotate } from "./rotate.js";
import { applyCrop } from "./crop.js";
import { applyResize } from "./resize.js";
import { applyRgbToHsv } from "./colorspace.js";
import { applyHistogramStretch, computeHistogram, drawHistogram } from "./histogram.js";
import { applyAdd, applyDivideByScalar } from "./arithmetic.js";
import { applyContrast } from "./contrast.js";
import { applyMeanFilter } from "./convolution.js";
import { applyPrewitt } from "./edge.js";
import { applySaltPepperNoise } from "./noise.js";
import { applyMedianFilter } from "./median.js";
import { applyUnsharpMask } from "./unsharp.js";
import { applyErode, applyDilate, applyOpening, applyClosing } from "./morphology.js";

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
  divideByScalar: applyDivideByScalar,
  contrast: applyContrast,
  meanFilter: applyMeanFilter,
  prewitt: applyPrewitt,
  saltPepper: applySaltPepperNoise,
  medianFilter: applyMedianFilter,
  unsharp: applyUnsharpMask,
  erode: applyErode,
  dilate: applyDilate,
  opening: applyOpening,
  closing: applyClosing,
};
