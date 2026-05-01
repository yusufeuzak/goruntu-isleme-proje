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

const workCanvas = document.createElement("canvas");
const workCtx = workCanvas.getContext("2d");
let originalImageDataUrl = "";
let isSelectingCrop = false;
let cropStartX = 0;
let cropStartY = 0;
let selectedCropRect = null;
let cropModeEnabled = false;

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

function setCropMode(enabled) {
  cropModeEnabled = enabled;
  if (applySelectionCropBtn) {
    applySelectionCropBtn.disabled = !enabled;
  }
  if (imageViewport) {
    imageViewport.classList.toggle("crop-mode", enabled);
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

    selectedOps.forEach((op) => {
      const operation = operationRegistry[op];
      if (operation) {
        current = operation(current);
      }
    });

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
    setCropMode(false);
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
  selectedCropRect = null;
  cropSelection.style.display = "none";
  setCropMode(false);
  if (rotateAngle) {
    rotateAngle.value = "0";
  }
  if (angleVal) {
    angleVal.textContent = "0°";
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

setCropMode(false);
