const fileInput = document.getElementById("fileInput");
const dropzone = document.getElementById("dropzone");
const previewImage = document.getElementById("previewImage");
const uploadMessage = document.getElementById("uploadMessage");
const removeImageBtn = document.getElementById("removeImageBtn");

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

function handleFile(file) {
  if (!file) return;
  if (!isAllowedImage(file)) {
    setMessage("Sadece JPG veya PNG dosyasi yukleyebilirsiniz.");
    return;
  }
  setMessage("");
  readAsDataUrl(file, (dataUrl) => {
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
  setMessage("");
});
