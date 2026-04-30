import numpy as np


def clip_uint8(arr: np.ndarray) -> np.ndarray:
    return np.clip(arr, 0, 255).astype(np.uint8)


def to_grayscale(img: np.ndarray) -> np.ndarray:
    h, w, _ = img.shape
    gray = np.zeros((h, w), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            b, g, r = img[y, x]
            val = int(0.114 * b + 0.587 * g + 0.299 * r)
            gray[y, x] = val
    return gray


def binary_threshold(img: np.ndarray, threshold: int = 127) -> np.ndarray:
    gray = to_grayscale(img) if img.ndim == 3 else img
    h, w = gray.shape
    out = np.zeros((h, w), dtype=np.uint8)
    for y in range(h):
        for x in range(w):
            out[y, x] = 255 if gray[y, x] >= threshold else 0
    return out


def rotate_nearest(img: np.ndarray, angle_deg: float) -> np.ndarray:
    angle_rad = np.deg2rad(angle_deg)
    cos_a = np.cos(angle_rad)
    sin_a = np.sin(angle_rad)

    h, w = img.shape[:2]
    cx, cy = w / 2.0, h / 2.0
    out = np.zeros_like(img)

    for y_out in range(h):
        for x_out in range(w):
            x_shift = x_out - cx
            y_shift = y_out - cy
            x_src = cos_a * x_shift + sin_a * y_shift + cx
            y_src = -sin_a * x_shift + cos_a * y_shift + cy
            xs = int(round(x_src))
            ys = int(round(y_src))
            if 0 <= ys < h and 0 <= xs < w:
                out[y_out, x_out] = img[ys, xs]
    return out


def crop_image(img: np.ndarray, x: int, y: int, w: int, h: int) -> np.ndarray:
    ih, iw = img.shape[:2]
    x0 = max(0, x)
    y0 = max(0, y)
    x1 = min(iw, x + w)
    y1 = min(ih, y + h)
    if x0 >= x1 or y0 >= y1:
        return img.copy()
    return img[y0:y1, x0:x1].copy()


def resize_nearest(img: np.ndarray, scale: float) -> np.ndarray:
    if scale <= 0:
        return img.copy()
    h, w = img.shape[:2]
    new_h = max(1, int(round(h * scale)))
    new_w = max(1, int(round(w * scale)))
    channels = 1 if img.ndim == 2 else img.shape[2]

    if channels == 1:
        out = np.zeros((new_h, new_w), dtype=np.uint8)
    else:
        out = np.zeros((new_h, new_w, channels), dtype=np.uint8)

    for y in range(new_h):
        for x in range(new_w):
            src_y = min(h - 1, int(round(y / scale)))
            src_x = min(w - 1, int(round(x / scale)))
            out[y, x] = img[src_y, src_x]
    return out


def resize_to_shape_nearest(img: np.ndarray, target_h: int, target_w: int) -> np.ndarray:
    src_h, src_w = img.shape[:2]
    channels = 1 if img.ndim == 2 else img.shape[2]

    if channels == 1:
        out = np.zeros((target_h, target_w), dtype=np.uint8)
    else:
        out = np.zeros((target_h, target_w, channels), dtype=np.uint8)

    for y in range(target_h):
        for x in range(target_w):
            src_y = min(src_h - 1, int((y * src_h) / target_h))
            src_x = min(src_w - 1, int((x * src_w) / target_w))
            out[y, x] = img[src_y, src_x]
    return out


def bgr_to_hsv_manual(img: np.ndarray) -> np.ndarray:
    h, w, _ = img.shape
    out = np.zeros((h, w, 3), dtype=np.uint8)

    for y in range(h):
        for x in range(w):
            b, g, r = img[y, x].astype(np.float32) / 255.0
            cmax = max(r, g, b)
            cmin = min(r, g, b)
            delta = cmax - cmin

            if delta == 0:
                h_deg = 0.0
            elif cmax == r:
                h_deg = 60.0 * (((g - b) / delta) % 6)
            elif cmax == g:
                h_deg = 60.0 * (((b - r) / delta) + 2)
            else:
                h_deg = 60.0 * (((r - g) / delta) + 4)

            s = 0.0 if cmax == 0 else (delta / cmax)
            v = cmax

            out[y, x, 0] = int((h_deg / 360.0) * 179.0)
            out[y, x, 1] = int(s * 255.0)
            out[y, x, 2] = int(v * 255.0)
    return out


def compute_histogram_gray(img: np.ndarray) -> np.ndarray:
    gray = to_grayscale(img) if img.ndim == 3 else img
    hist = np.zeros(256, dtype=np.int32)
    h, w = gray.shape
    for y in range(h):
        for x in range(w):
            hist[gray[y, x]] += 1
    return hist


def histogram_stretch(img: np.ndarray) -> np.ndarray:
    gray = to_grayscale(img) if img.ndim == 3 else img
    h, w = gray.shape
    min_v = 255
    max_v = 0

    for y in range(h):
        for x in range(w):
            v = int(gray[y, x])
            if v < min_v:
                min_v = v
            if v > max_v:
                max_v = v

    out = np.zeros_like(gray)
    if max_v == min_v:
        return out

    scale = 255.0 / (max_v - min_v)
    for y in range(h):
        for x in range(w):
            out[y, x] = int((gray[y, x] - min_v) * scale)
    return out


def add_images(img1: np.ndarray, img2: np.ndarray) -> np.ndarray:
    if img1.shape != img2.shape:
        return img1
    out = np.zeros_like(img1)
    if img1.ndim == 2:
        h, w = img1.shape
        for y in range(h):
            for x in range(w):
                out[y, x] = min(255, int(img1[y, x]) + int(img2[y, x]))
        return out

    h, w, c = img1.shape
    for y in range(h):
        for x in range(w):
            for k in range(c):
                out[y, x, k] = min(255, int(img1[y, x, k]) + int(img2[y, x, k]))
    return out


def divide_images(img1: np.ndarray, img2: np.ndarray) -> np.ndarray:
    if img1.shape != img2.shape:
        return img1
    out = np.zeros_like(img1)
    if img1.ndim == 2:
        h, w = img1.shape
        for y in range(h):
            for x in range(w):
                denom = int(img2[y, x])
                if denom == 0:
                    out[y, x] = 255
                else:
                    out[y, x] = min(255, int((int(img1[y, x]) / denom) * 255))
        return out

    h, w, c = img1.shape
    for y in range(h):
        for x in range(w):
            for k in range(c):
                denom = int(img2[y, x, k])
                if denom == 0:
                    out[y, x, k] = 255
                else:
                    out[y, x, k] = min(255, int((int(img1[y, x, k]) / denom) * 255))
    return out


def adjust_contrast(img: np.ndarray, factor: float) -> np.ndarray:
    out = np.zeros_like(img)
    if img.ndim == 2:
        h, w = img.shape
        for y in range(h):
            for x in range(w):
                val = 128 + factor * (int(img[y, x]) - 128)
                out[y, x] = np.uint8(max(0, min(255, int(round(val)))))
        return out

    h, w, c = img.shape
    for y in range(h):
        for x in range(w):
            for k in range(c):
                val = 128 + factor * (int(img[y, x, k]) - 128)
                out[y, x, k] = np.uint8(max(0, min(255, int(round(val)))))
    return out


def convolve_manual(img: np.ndarray, kernel: np.ndarray) -> np.ndarray:
    if img.ndim == 2:
        img3 = img[:, :, None]
    else:
        img3 = img

    h, w, c = img3.shape
    kh, kw = kernel.shape
    py = kh // 2
    px = kw // 2

    padded = np.zeros((h + 2 * py, w + 2 * px, c), dtype=np.float32)
    padded[py:py + h, px:px + w] = img3.astype(np.float32)

    out = np.zeros((h, w, c), dtype=np.float32)
    for y in range(h):
        for x in range(w):
            for ch in range(c):
                acc = 0.0
                for ky in range(kh):
                    for kx in range(kw):
                        acc += padded[y + ky, x + kx, ch] * kernel[ky, kx]
                out[y, x, ch] = acc

    out_u8 = clip_uint8(out)
    if img.ndim == 2:
        return out_u8[:, :, 0]
    return out_u8


def mean_filter(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    kernel = np.ones((ksize, ksize), dtype=np.float32) / float(ksize * ksize)
    return convolve_manual(img, kernel)


def prewitt_edge(img: np.ndarray) -> np.ndarray:
    gray = to_grayscale(img) if img.ndim == 3 else img
    gx_kernel = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    gy_kernel = np.array([[1, 1, 1], [0, 0, 0], [-1, -1, -1]], dtype=np.float32)

    gx = convolve_manual(gray, gx_kernel).astype(np.float32)
    gy = convolve_manual(gray, gy_kernel).astype(np.float32)
    h, w = gray.shape
    mag = np.zeros((h, w), dtype=np.float32)
    for y in range(h):
        for x in range(w):
            mag[y, x] = np.sqrt(gx[y, x] * gx[y, x] + gy[y, x] * gy[y, x])
    return clip_uint8(mag)


def add_salt_pepper_noise(img: np.ndarray, amount: float = 0.05) -> np.ndarray:
    out = img.copy()
    h, w = img.shape[:2]
    total = h * w
    noisy = int(total * amount)
    for i in range(noisy):
        y = np.random.randint(0, h)
        x = np.random.randint(0, w)
        if i % 2 == 0:
            out[y, x] = 0
        else:
            out[y, x] = 255
    return out


def median_filter_manual(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    if img.ndim == 2:
        img3 = img[:, :, None]
    else:
        img3 = img

    h, w, c = img3.shape
    p = ksize // 2
    padded = np.zeros((h + 2 * p, w + 2 * p, c), dtype=np.uint8)
    padded[p:p + h, p:p + w] = img3

    out = np.zeros_like(img3)
    for y in range(h):
        for x in range(w):
            for ch in range(c):
                values = []
                for ky in range(ksize):
                    for kx in range(ksize):
                        values.append(int(padded[y + ky, x + kx, ch]))
                values.sort()
                out[y, x, ch] = values[len(values) // 2]

    if img.ndim == 2:
        return out[:, :, 0]
    return out


def unsharp_mask_manual(img: np.ndarray, amount: float = 1.0) -> np.ndarray:
    blurred = mean_filter(img, 3).astype(np.float32)
    src = img.astype(np.float32)
    mask = src - blurred
    sharp = src + amount * mask
    return clip_uint8(sharp)


def _binary_for_morph(img: np.ndarray) -> np.ndarray:
    if img.ndim == 3:
        return binary_threshold(img, 127)
    return binary_threshold(img, 127)


def erode_manual(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    src = _binary_for_morph(img)
    h, w = src.shape
    p = ksize // 2
    out = np.zeros_like(src)
    for y in range(h):
        for x in range(w):
            ok = True
            for ky in range(-p, p + 1):
                for kx in range(-p, p + 1):
                    yy = y + ky
                    xx = x + kx
                    if yy < 0 or yy >= h or xx < 0 or xx >= w or src[yy, xx] == 0:
                        ok = False
                        break
                if not ok:
                    break
            out[y, x] = 255 if ok else 0
    return out


def dilate_manual(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    src = _binary_for_morph(img)
    h, w = src.shape
    p = ksize // 2
    out = np.zeros_like(src)
    for y in range(h):
        for x in range(w):
            hit = False
            for ky in range(-p, p + 1):
                for kx in range(-p, p + 1):
                    yy = y + ky
                    xx = x + kx
                    if 0 <= yy < h and 0 <= xx < w and src[yy, xx] > 0:
                        hit = True
            out[y, x] = 255 if hit else 0
    return out


def opening_manual(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    return dilate_manual(erode_manual(img, ksize), ksize)


def closing_manual(img: np.ndarray, ksize: int = 3) -> np.ndarray:
    return erode_manual(dilate_manual(img, ksize), ksize)
