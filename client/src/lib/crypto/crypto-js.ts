import CryptoJS from "crypto-js";

const getIPAddress = async () => {
  try {
    const response = await fetch("https://api64.ipify.org?format=json");
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Error fetching IP:", error);
    return "";
  }
};

const generateBrowserFingerprint = async () => {
  const ip = await getIPAddress();
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.hardwareConcurrency || "",
    window.location.hostname || "",
    ip,
    (function () {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.textBaseline = "top";
          ctx.font = "14px 'Arial'";
          ctx.fillText("Fingerprint Test", 2, 2);
          return canvas.toDataURL();
        }
      } catch {
        return "";
      }
    })(),
  ].filter(Boolean);

  return CryptoJS.SHA256(components.join("||")).toString();
};

export const encryptWithFingerprint = async (data: string): Promise<string> => {
  const encryptionKey = await generateBrowserFingerprint();
  return CryptoJS.AES.encrypt(data, encryptionKey).toString();
};

export const decryptWithFingerprint = async (
  encryptedData: string
): Promise<string> => {
  const encryptionKey = await generateBrowserFingerprint();
  const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
  if (!decryptedText)
    console.error("Decryption failed. Possible fingerprint mismatch.");
  return decryptedText;
};
