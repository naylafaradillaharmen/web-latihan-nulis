const DEVICE_ID_KEY = "buku_latihan_nulis_device_id";

/**
 * Mendapatkan deviceId dari localStorage, atau membuat UUID baru jika belum ada.
 */
export function getOrCreateDeviceId() {
  if (typeof window === "undefined") {
    return "server-rendered";
  }

  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      deviceId = crypto.randomUUID();
    } else {
      deviceId = "dev-" + Math.random().toString(36).substring(2, 15) + "-" + Date.now().toString(36);
    }
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}
