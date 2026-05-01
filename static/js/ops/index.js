import { applyGrayscale } from "./grayscale.js";
import { applyBinary } from "./binary.js";
import { applyRotate } from "./rotate.js";

export const operationRegistry = {
  grayscale: applyGrayscale,
  binary: applyBinary,
  rotate: applyRotate,
};
