import { applyGrayscale } from "./grayscale.js";
import { applyBinary } from "./binary.js";
import { applyRotate } from "./rotate.js";
import { applyCrop } from "./crop.js";

export const operationRegistry = {
  grayscale: applyGrayscale,
  binary: applyBinary,
  rotate: applyRotate,
  crop: applyCrop,
};
