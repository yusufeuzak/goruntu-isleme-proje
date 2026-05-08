import { operationRegistry } from "./ops/index.js";

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const previewImage = document.getElementById("previewImage");
const imageViewport = document.getElementById("imageViewport");
const cropSelection = document.getElementById("cropSelection");
const uploadMessage = document.getElementById("uploadMessage");
const removeImageBtn = document.getElementById("removeImageBtn");
const applySelectedOpsBtn = document.getElementById("applySelectedOpsBtn");
const clearSelectedOpsBtn = document.getElementById("clearSelectedOpsBtn");
const rotateAngle = document.getElementById("rotateAngle");
const angleVal = document.getElementById("angleVal");
const startCropBtn = document.getElementById("startCropBtn");
const applySelectionCropBtn = document.getElementById("applySelectionCropBtn");

// Yeni kontroller
const resizeScale = document.getElementById("resizeScale");
const scaleVal = document.getElementById("scaleVal");
const applyResizeBtn = document.getElementById("applyResizeBtn");
const fileInput2 = document.getElementById("fileInput2");
const secondImageName = document.getElementById("secondImageName");
const applyAddBtn = document.getElementById("applyAddBtn");
const applyDivideBtn = document.getElementById("applyDivideBtn");
const histogramSection = document.getElementById("histogramSection");
const histogramOriginalCanvas = document.getElementById("histogramOriginal");
const histogramStretchedCanvas = document.getElementById("histogramStretched");

// Kontrast ve Mean Filtre kontrolleri
const contrastFactor = document.getElementById("contrastFactor");
const contrastVal = document.getElementById("contrastVal");
const applyContrastBtn = document.getElementById("applyContrastBtn");
const meanKernelSize = document.getElementById("meanKernelSize");
const applyMeanBtn = document.getElementById("applyMeanBtn");

// Yeni eklenen kontroller (5 yeni islem)
const thresholdValue = document.getElementById("thresholdValue");
const thresholdVal = document.getElementById("thresholdVal");
const applyThresholdBtn = document.getElementById("applyThresholdBtn");
const applyPrewittBtn = document.getElementById("applyPrewittBtn");
const noiseAmount = document.getElementById("noiseAmount");
const noiseAmountVal = document.getElementById("noiseAmountVal");
const medianKernelSize = document.getElementById("medianKernelSize");
const applyNoiseBtn = document.getElementById("applyNoiseBtn");
const applyMedianBtn = document.getElementById("applyMedianBtn");
const unsharpAmount = document.getElementById("unsharpAmount");
const unsharpAmountVal = document.getElementById("unsharpAmountVal");
const applyUnsharpBtn = document.getElementById("applyUnsharpBtn");
const morphKernelSize = document.getElementById("morphKernelSize");
const applyErodeBtn = document.getElementById("applyErodeBtn");
const applyDilateBtn = document.getElementById("applyDilateBtn");
const applyOpeningBtn = document.getElementById("applyOpeningBtn");
const applyClosingBtn = document.getElementById("applyClosingBtn");

const workCanvas = document.createElement("canvas");
const workCtx = workCanvas.getContext("2d");
let originalImageDataUrl = "";
let isSelectingCrop = false;
let cropStartX = 0;
let cropStartY = 0;
let selectedCropRect = null;
let cropModeEnabled = false;

// İkinci görsel için
let secondImageDataUrl = "";

function isAllowedImage(file) {
  const allowedTypes = ["image/jpeg", "image/png"];
  const lowerName = file.name.toLowerCase();
  const allowedExt = [".jpg", ".jpeg", ".png"];
  return allowedTypes.includes(file.type) || allowedExt.some((ext) => lowerName.endsWith(ext));
}

function setMessage(text = "") {
  uploadMessage.textContent = text;
}

function readAsDataUrl(file, cb) {
  const reader = new FileReader();
  reader.onload = (e) => cb(e.target.result);
  reader.readAsDataURL(file);
}

function imageDataToDataUrl(imageData) {
  workCanvas.width = imageData.width;
  workCanvas.height = imageData.height;
  workCtx.putImageData(imageData, 0, 0);
  return workCanvas.toDataURL("image/png");
}

function dataUrlToImageData(dataUrl, callback) {
  const img = new Image();
  img.onload = () => {
    workCanvas.width = img.width;
    workCanvas.height = img.height;
    workCtx.drawImage(img, 0, 0);
    callback(workCtx.getImageData(0, 0, img.width, img.height));
  };
  img.src = dataUrl;
}

function setCropMode(enabled) {
  cropModeEnabled = enabled;
  if (applySelectionCropBtn) {
    applySelectionCropBtn.disabled = !enabled;
  }
  if (imageViewport) {
    imageViewport.classList.toggle("crop-mode", enabled);
    imageViewport.style.cursor = enabled ? "crosshair" : "grab";
  }
}

function applySelectedOperations() {
  if (!previewImage.src) {
    setMessage("Lutfen once bir gorsel yukleyin.");
    return;
  }

  const selectedOps = Array.from(document.querySelectorAll(".op-checkbox:checked")).map(
    (item) => item.value
  );
  if (selectedOps.length === 0) {
    setMessage("Lutfen en az bir islem secin.");
    return;
  }

  const image = new Image();
  image.onload = () => {
    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    let current = workCtx.getImageData(0, 0, image.width, image.height);

    // Histogram gösterilecek mi kontrol
    const showHistogram = selectedOps.includes("histogramStretch");

    // Histogram germe öncesi orijinal histogramı hesapla
    let originalHist = null;
    if (showHistogram) {
      originalHist = operationRegistry.computeHistogram(current);
    }

    selectedOps.forEach((op) => {
      const operation = operationRegistry[op];
      if (operation) {
        current = operation(current);
      }
    });

    // Histogram germe sonrası histogram
    if (showHistogram) {
      const stretchedHist = operationRegistry.computeHistogram(current);
      histogramSection.style.display = "block";
      operationRegistry.drawHistogram(originalHist, histogramOriginalCanvas, "#ef4444");
      operationRegistry.drawHistogram(stretchedHist, histogramStretchedCanvas, "#22c55e");
    }

    previewImage.src = imageDataToDataUrl(current);
    setMessage("");
  };
  image.src = previewImage.src;
}


function clearSelectedOperations() {
  const selectedCheckboxes = document.querySelectorAll(".op-checkbox:checked");
  selectedCheckboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  selectedCropRect = null;
  cropSelection.style.display = "none";
  setCropMode(false);
  if (rotateAngle) {
    rotateAngle.value = "0";
  }
  if (angleVal) {
    angleVal.textContent = "0°";
  }
  if (resizeScale) {
    resizeScale.value = "100";
  }
  if (scaleVal) {
    scaleVal.textContent = "1.00x";
  }
  if (contrastFactor) {
    contrastFactor.value = "100";
  }
  if (contrastVal) {
    contrastVal.textContent = "1.00";
  }
  if (meanKernelSize) {
    meanKernelSize.value = "3";
  }
  // Histogram gizle
  if (histogramSection) {
    histogramSection.style.display = "none";
  }
  if (originalImageDataUrl) {
    previewImage.src = originalImageDataUrl;
  }
  setMessage("");
}

function handleFile(file) {
  if (!file) return;
  if (!isAllowedImage(file)) {
    setMessage("Sadece JPG veya PNG dosyasi yukleyebilirsiniz.");
    return;
  }
  setMessage("");
  readAsDataUrl(file, (dataUrl) => {
    originalImageDataUrl = dataUrl;
    previewImage.src = dataUrl;
    if (rotateAngle) {
      rotateAngle.value = "0";
    }
    if (angleVal) {
      angleVal.textContent = "0°";
    }
    if (resizeScale) {
      resizeScale.value = "100";
    }
    if (scaleVal) {
      scaleVal.textContent = "1.00x";
    }
    setCropMode(false);
    if (histogramSection) {
      histogramSection.style.display = "none";
    }
  });
}

function applyRotationFromOriginal(angleDeg) {
  if (!originalImageDataUrl) return;
  const rotateOperation = operationRegistry.rotate;
  if (!rotateOperation) return;

  const image = new Image();
  image.onload = () => {
    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    const originalImageData = workCtx.getImageData(0, 0, image.width, image.height);
    const rotatedImage = rotateOperation(originalImageData, angleDeg);
    previewImage.src = imageDataToDataUrl(rotatedImage);
    setMessage("");
  };
  image.src = originalImageDataUrl;
}

function applyCropToCurrentImage() {
  if (!previewImage.src) {
    setMessage("Lutfen once bir gorsel yukleyin.");
    return;
  }

  if (!selectedCropRect) {
    setMessage("Lutfen once kirpmak icin bir alan secin.");
    return;
  }

  const cropOperation = operationRegistry.crop;
  if (!cropOperation) return;

  const image = new Image();
  image.onload = () => {
    const displayW = previewImage.clientWidth || 1;
    const displayH = previewImage.clientHeight || 1;
    const scaleX = image.width / displayW;
    const scaleY = image.height / displayH;

    const cropX = Math.floor(selectedCropRect.x * scaleX);
    const cropY = Math.floor(selectedCropRect.y * scaleY);
    const cropW = Math.max(1, Math.floor(selectedCropRect.width * scaleX));
    const cropH = Math.max(1, Math.floor(selectedCropRect.height * scaleY));

    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    const currentImageData = workCtx.getImageData(0, 0, image.width, image.height);
    const croppedImage = cropOperation(currentImageData, cropX, cropY, cropW, cropH);
    previewImage.src = imageDataToDataUrl(croppedImage);
    selectedCropRect = null;
    cropSelection.style.display = "none";
    setCropMode(false);
    setMessage("");
  };
  image.src = previewImage.src;
}

function getCropPointFromMouse(event) {
  const rect = imageViewport.getBoundingClientRect();
  const x = Math.max(0, Math.min(event.clientX - rect.left, previewImage.clientWidth));
  const y = Math.max(0, Math.min(event.clientY - rect.top, previewImage.clientHeight));
  return { x, y };
}

function updateCropSelectionRect(x1, y1, x2, y2) {
  const left = Math.min(x1, x2);
  const top = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  selectedCropRect = { x: left, y: top, width, height };
  cropSelection.style.left = `${left}px`;
  cropSelection.style.top = `${top}px`;
  cropSelection.style.width = `${width}px`;
  cropSelection.style.height = `${height}px`;
  cropSelection.style.display = width > 1 && height > 1 ? "block" : "none";
}

// ====== RESIZE (Yaklaştırma/Uzaklaştırma) ======
function applyResizeFromCurrent() {
  if (!previewImage.src) {
    setMessage("Lutfen once bir gorsel yukleyin.");
    return;
  }
  const scale = parseFloat(resizeScale.value) / 100.0;
  const resizeOperation = operationRegistry.resize;
  if (!resizeOperation) return;

  const image = new Image();
  image.onload = () => {
    const targetW = Math.round(image.width * scale);
    const targetH = Math.round(image.height * scale);

    if (targetW > 8000 || targetH > 8000) {
      setMessage(`Hata: Gorsel cok buyuk olacak (${targetW}x${targetH}). Tarayici cokuşunu onlemek icin islem iptal edildi.`);
      return;
    }

    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    const currentData = workCtx.getImageData(0, 0, image.width, image.height);
    const resized = resizeOperation(currentData, scale);
    previewImage.src = imageDataToDataUrl(resized);
    setMessage(`Boyut: ${resized.width}x${resized.height} (${scale.toFixed(2)}x)`);
    
    // Resmin ortasına kaydır
    if (imageViewport) {
      setTimeout(() => {
        imageViewport.scrollLeft = (imageViewport.scrollWidth - imageViewport.clientWidth) / 2;
        imageViewport.scrollTop = (imageViewport.scrollHeight - imageViewport.clientHeight) / 2;
      }, 50);
    }
  };
  image.src = previewImage.src;
}

// ====== KONTRAST ARTIRMA ======
function applyContrastFromCurrent() {
  if (!previewImage.src) {
    setMessage("Lutfen once bir gorsel yukleyin.");
    return;
  }
  const factor = parseFloat(contrastFactor.value) / 100.0;
  const contrastOp = operationRegistry.contrast;
  if (!contrastOp) return;

  const image = new Image();
  image.onload = () => {
    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    const currentData = workCtx.getImageData(0, 0, image.width, image.height);
    const result = contrastOp(currentData, factor);
    previewImage.src = imageDataToDataUrl(result);
    setMessage(`Kontrast faktor: ${factor.toFixed(2)}`);
  };
  image.src = previewImage.src;
}

// ====== MEAN FİLTRE ======
function applyMeanFromCurrent() {
  if (!previewImage.src) {
    setMessage("Lutfen once bir gorsel yukleyin.");
    return;
  }
  const ksize = parseInt(meanKernelSize.value) || 3;
  const meanOp = operationRegistry.meanFilter;
  if (!meanOp) return;

  const image = new Image();
  image.onload = () => {
    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    const currentData = workCtx.getImageData(0, 0, image.width, image.height);
    const result = meanOp(currentData, ksize);
    previewImage.src = imageDataToDataUrl(result);
    setMessage(`Mean filtre uygulandi (${ksize}x${ksize})`);
  };
  image.src = previewImage.src;
}

// ====== ORTAK YARDIMCI: tek-islem-uygula ======
function applyOpToCurrent(opName, args = [], successMessage = "") {
  if (!previewImage.src) {
    setMessage("Lutfen once bir gorsel yukleyin.");
    return;
  }
  const operation = operationRegistry[opName];
  if (!operation) return;

  const image = new Image();
  image.onload = () => {
    workCanvas.width = image.width;
    workCanvas.height = image.height;
    workCtx.drawImage(image, 0, 0);
    const currentData = workCtx.getImageData(0, 0, image.width, image.height);
    const result = operation(currentData, ...args);
    previewImage.src = imageDataToDataUrl(result);
    setMessage(successMessage);
  };
  image.src = previewImage.src;
}

// ====== TEK ESIKLEME (Ayarlanabilir) ======
function applyThresholdFromCurrent() {
  const t = parseInt(thresholdValue.value) || 128;
  applyOpToCurrent("binary", [t], `Esik degeri: ${t}`);
}

// ====== PREWITT KENAR BULMA ======
function applyPrewittFromCurrent() {
  applyOpToCurrent("prewitt", [], "Prewitt kenar bulma uygulandi.");
}

// ====== SALT & PEPPER GURULTU ======
function applyNoiseFromCurrent() {
  const amount = (parseInt(noiseAmount.value) || 5) / 100.0;
  applyOpToCurrent("saltPepper", [amount], `Salt&Pepper gurultu eklendi (%${(amount * 100).toFixed(0)}).`);
}

// ====== MEDIAN FILTRE ======
function applyMedianFromCurrent() {
  const ksize = parseInt(medianKernelSize.value) || 3;
  applyOpToCurrent("medianFilter", [ksize], `Median filtre uygulandi (${ksize}x${ksize}).`);
}

// ====== UNSHARP MASK ======
function applyUnsharpFromCurrent() {
  const amount = (parseInt(unsharpAmount.value) || 100) / 100.0;
  applyOpToCurrent("unsharp", [amount], `Unsharp uygulandi (miktar: ${amount.toFixed(2)}).`);
}

// ====== MORFOLOJIK ISLEMLER ======
function applyMorphFromCurrent(opName, label) {
  const ksize = parseInt(morphKernelSize.value) || 3;
  applyOpToCurrent(opName, [ksize], `${label} uygulandi (${ksize}x${ksize}).`);
}

// ====== ARİTMETİK İŞLEMLER ======
function handleSecondFile(file) {
  if (!file) return;
  if (!isAllowedImage(file)) {
    setMessage("Ikinci gorsel icin sadece JPG veya PNG dosyasi yukleyebilirsiniz.");
    return;
  }
  readAsDataUrl(file, (dataUrl) => {
    secondImageDataUrl = dataUrl;
    if (secondImageName) {
      secondImageName.textContent = "2. gorsel yuklendi: " + file.name;
    }
  });
}

function applyArithmeticOp(opName) {
  if (!previewImage.src) {
    setMessage("Lutfen birinci gorseli yukleyin.");
    return;
  }
  if (!secondImageDataUrl) {
    setMessage("Lutfen ikinci gorseli yukleyin.");
    return;
  }

  const operation = operationRegistry[opName];
  if (!operation) return;

  // Birinci görseli ImageData'ya çevir
  const img1 = new Image();
  img1.onload = () => {
    workCanvas.width = img1.width;
    workCanvas.height = img1.height;
    workCtx.drawImage(img1, 0, 0);
    const data1 = workCtx.getImageData(0, 0, img1.width, img1.height);

    // İkinci görseli ImageData'ya çevir
    const img2 = new Image();
    img2.onload = () => {
      const tempCanvas = document.createElement("canvas");
      const tempCtx = tempCanvas.getContext("2d");
      tempCanvas.width = img2.width;
      tempCanvas.height = img2.height;
      tempCtx.drawImage(img2, 0, 0);
      const data2 = tempCtx.getImageData(0, 0, img2.width, img2.height);

      const result = operation(data1, data2);
      previewImage.src = imageDataToDataUrl(result);
      setMessage("");
    };
    img2.src = secondImageDataUrl;
  };
  img1.src = previewImage.src;
}


// ====== EVENT LISTENERS ======

fileInput.addEventListener("change", (e) => {
  handleFile(e.target.files[0]);
});

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("active");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("active");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("active");
  handleFile(e.dataTransfer.files[0]);
});

removeImageBtn.addEventListener("click", () => {
  previewImage.src = "";
  fileInput.value = "";
  originalImageDataUrl = "";
  secondImageDataUrl = "";
  selectedCropRect = null;
  cropSelection.style.display = "none";
  setCropMode(false);
  if (rotateAngle) {
    rotateAngle.value = "0";
  }
  if (angleVal) {
    angleVal.textContent = "0°";
  }
  if (resizeScale) {
    resizeScale.value = "100";
  }
  if (scaleVal) {
    scaleVal.textContent = "1.00x";
  }
  if (histogramSection) {
    histogramSection.style.display = "none";
  }
  if (secondImageName) {
    secondImageName.textContent = "";
  }
  if (fileInput2) {
    fileInput2.value = "";
  }
  setMessage("");
});

applySelectedOpsBtn.addEventListener("click", applySelectedOperations);
clearSelectedOpsBtn.addEventListener("click", clearSelectedOperations);
if (startCropBtn) {
  startCropBtn.addEventListener("click", () => {
    if (!previewImage.src) {
      setMessage("Lutfen once bir gorsel yukleyin.");
      return;
    }
    selectedCropRect = null;
    cropSelection.style.display = "none";
    setCropMode(true);
    setMessage("Kirpma modu aktif. Fare ile alan secin.");
  });
}
if (applySelectionCropBtn) {
  applySelectionCropBtn.addEventListener("click", applyCropToCurrentImage);
}

if (rotateAngle && angleVal) {
  rotateAngle.addEventListener("input", () => {
    angleVal.textContent = `${rotateAngle.value}°`;
    applyRotationFromOriginal(parseFloat(rotateAngle.value) || 0);
  });
}

// Resize slider
if (resizeScale && scaleVal) {
  resizeScale.addEventListener("input", () => {
    const s = (parseFloat(resizeScale.value) / 100.0).toFixed(2);
    scaleVal.textContent = `${s}x`;
  });
}

if (applyResizeBtn) {
  applyResizeBtn.addEventListener("click", applyResizeFromCurrent);
}

// İkinci görsel yükleme
if (fileInput2) {
  fileInput2.addEventListener("change", (e) => {
    handleSecondFile(e.target.files[0]);
  });
}

// Aritmetik işlem butonları
if (applyAddBtn) {
  applyAddBtn.addEventListener("click", () => applyArithmeticOp("addImages"));
}
if (applyDivideBtn) {
  applyDivideBtn.addEventListener("click", () => applyArithmeticOp("divideImages"));
}

// Kontrast slider
if (contrastFactor && contrastVal) {
  contrastFactor.addEventListener("input", () => {
    const f = (parseFloat(contrastFactor.value) / 100.0).toFixed(2);
    contrastVal.textContent = f;
  });
}

if (applyContrastBtn) {
  applyContrastBtn.addEventListener("click", applyContrastFromCurrent);
}

// Mean filtre butonu
if (applyMeanBtn) {
  applyMeanBtn.addEventListener("click", applyMeanFromCurrent);
}

// Tek esikleme slider + buton
if (thresholdValue && thresholdVal) {
  thresholdValue.addEventListener("input", () => {
    thresholdVal.textContent = thresholdValue.value;
  });
}
if (applyThresholdBtn) {
  applyThresholdBtn.addEventListener("click", applyThresholdFromCurrent);
}

// Prewitt buton
if (applyPrewittBtn) {
  applyPrewittBtn.addEventListener("click", applyPrewittFromCurrent);
}

// Salt & Pepper slider + butonlar
if (noiseAmount && noiseAmountVal) {
  noiseAmount.addEventListener("input", () => {
    noiseAmountVal.textContent = `%${noiseAmount.value}`;
  });
}
if (applyNoiseBtn) {
  applyNoiseBtn.addEventListener("click", applyNoiseFromCurrent);
}
if (applyMedianBtn) {
  applyMedianBtn.addEventListener("click", applyMedianFromCurrent);
}

// Unsharp slider + buton
if (unsharpAmount && unsharpAmountVal) {
  unsharpAmount.addEventListener("input", () => {
    const v = (parseInt(unsharpAmount.value) / 100.0).toFixed(2);
    unsharpAmountVal.textContent = v;
  });
}
if (applyUnsharpBtn) {
  applyUnsharpBtn.addEventListener("click", applyUnsharpFromCurrent);
}

// Morfolojik islemler
if (applyErodeBtn) {
  applyErodeBtn.addEventListener("click", () => applyMorphFromCurrent("erode", "Asinma"));
}
if (applyDilateBtn) {
  applyDilateBtn.addEventListener("click", () => applyMorphFromCurrent("dilate", "Genisleme"));
}
if (applyOpeningBtn) {
  applyOpeningBtn.addEventListener("click", () => applyMorphFromCurrent("opening", "Acma"));
}
if (applyClosingBtn) {
  applyClosingBtn.addEventListener("click", () => applyMorphFromCurrent("closing", "Kapama"));
}

if (imageViewport && cropSelection) {
  imageViewport.addEventListener("mousedown", (event) => {
    if (!previewImage.src || !cropModeEnabled) return;
    isSelectingCrop = true;
    const p = getCropPointFromMouse(event);
    cropStartX = p.x;
    cropStartY = p.y;
    updateCropSelectionRect(cropStartX, cropStartY, cropStartX, cropStartY);
  });

  imageViewport.addEventListener("mousemove", (event) => {
    if (!isSelectingCrop) return;
    const p = getCropPointFromMouse(event);
    updateCropSelectionRect(cropStartX, cropStartY, p.x, p.y);
  });

  window.addEventListener("mouseup", () => {
    isSelectingCrop = false;
  });
}

// ====== DRAG TO SCROLL (SÜRÜKLE KAYDIR) ======
let isPanning = false;
let startX, startY, scrollLeft, scrollTop;

if (imageViewport) {
  imageViewport.addEventListener("mousedown", (e) => {
    if (cropModeEnabled || !previewImage.src) return;
    isPanning = true;
    imageViewport.style.cursor = "grabbing";
    startX = e.pageX - imageViewport.offsetLeft;
    startY = e.pageY - imageViewport.offsetTop;
    scrollLeft = imageViewport.scrollLeft;
    scrollTop = imageViewport.scrollTop;
  });

  imageViewport.addEventListener("mouseleave", () => {
    isPanning = false;
    if (imageViewport) {
      imageViewport.style.cursor = cropModeEnabled ? "crosshair" : "grab";
    }
  });

  window.addEventListener("mouseup", () => {
    isPanning = false;
    if (imageViewport) {
      imageViewport.style.cursor = cropModeEnabled ? "crosshair" : "grab";
    }
  });

  imageViewport.addEventListener("mousemove", (e) => {
    if (!isPanning || cropModeEnabled) return;
    e.preventDefault();
    const x = e.pageX - imageViewport.offsetLeft;
    const y = e.pageY - imageViewport.offsetTop;
    const walkX = (x - startX); // Scroll hızı
    const walkY = (y - startY);
    imageViewport.scrollLeft = scrollLeft - walkX;
    imageViewport.scrollTop = scrollTop - walkY;
  });
}

setCropMode(false);
