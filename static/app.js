const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const previewImage = document.getElementById("previewImage");
const uploadMessage = document.getElementById("uploadMessage");
const removeImageBtn = document.getElementById("removeImageBtn");
const applySelectedOpsBtn = document.getElementById("applySelectedOpsBtn");
const clearSelectedOpsBtn = document.getElementById("clearSelectedOpsBtn");

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

function applyGrayscale(imageData) {
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
      if (op === "grayscale") current = applyGrayscale(current);
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
  });
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
  setMessage("");
});

applySelectedOpsBtn.addEventListener("click", applySelectedOperations);
clearSelectedOpsBtn.addEventListener("click", clearSelectedOperations);
