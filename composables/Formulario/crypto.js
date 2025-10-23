import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.NUXT_SECRET_KEY || "clave_fallback_123";

export function encryptData(data) {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (error) {
    console.error("Error encriptando:", error);
    return null;
  }
}

export function decryptData(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Error desencriptando:", error);
    return null;
  }
}
