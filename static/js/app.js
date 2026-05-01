import { operationRegistry } from "./ops/index.js";

const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const previewImage = document.getElementById("previewImage");
const uploadMessage = document.getElementById("uploadMessage");
const removeImageBtn = document.getElementById("removeImageBtn");
const applySelectedOpsBtn = document.getElementById("applySelectedOpsBtn");
const clearSelectedOpsBtn = document.getElementById("clearSelectedOpsBtn");
const rotateAngle = document.getElementById("rotateAngle");
const angleVal = document.getElementById("angleVal");

const workCanvas = document.createElement("canvas");
const workCtx = workCanvas.getContext("2d");
let originalImageDataUrl = "";

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

if (rotateAngle && angleVal) {
  rotateAngle.addEventListener("input", () => {
    angleVal.textContent = `${rotateAngle.value}°`;
    applyRotationFromOriginal(parseFloat(rotateAngle.value) || 0);
  });
}
