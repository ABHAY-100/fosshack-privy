import type { KeyPair, StoredKeyData } from "../../types/crypto"
import { encryptWithFingerprint, decryptWithFingerprint } from "./crypto-js"
import { CHUNK_SIZE, CHUNK_SEPARATOR } from "../constants"
import { toast } from "sonner"
import { generateAESKey, exportAESKey, importAESKey, encryptWithAES, decryptWithAES } from "./aes-crypto"

export const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: "RSA-OAEP",
        modulusLength: 2048,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: "SHA-256",
      },
      true,
      ["encrypt", "decrypt"],
    )
    return keyPair
  } catch (error) {
    console.error("Key generation error:", error)
    throw new Error("Failed to generate encryption keys")
  }
}

export const exportPublicKey = async (publicKey: CryptoKey): Promise<string> => {
  try {
    const exported = await window.crypto.subtle.exportKey("spki", publicKey)
    return btoa(String.fromCharCode(...new Uint8Array(exported)))
  } catch (error) {
    console.error("Public key export error:", error)
    throw new Error("Failed to export public key")
  }
}

export const importPublicKey = async (publicKeyString: string): Promise<CryptoKey> => {
  try {
    const keyData = Uint8Array.from(atob(publicKeyString), (c) => c.charCodeAt(0))
    return await window.crypto.subtle.importKey(
      "spki",
      keyData,
      {
        name: "RSA-OAEP",
        hash: "SHA-256",
      },
      true,
      ["encrypt"],
    )
  } catch (error) {
    console.error("Public key import error:", error)
    throw new Error("Failed to import public key")
  }
}

const encryptAESKey = async (aesKeyString: string, publicKey: CryptoKey): Promise<string> => {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(aesKeyString)
    const encrypted = await window.crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, data)
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)))
  } catch (error) {
    console.error("AES key encryption error:", error)
    throw new Error("Failed to encrypt AES key")
  }
}

const decryptAESKey = async (encryptedAESKey: string, privateKey: CryptoKey): Promise<string> => {
  try {
    const data = Uint8Array.from(atob(encryptedAESKey), (c) => c.charCodeAt(0))
    const decrypted = await window.crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, data)
    const decoder = new TextDecoder()
    return decoder.decode(decrypted)
  } catch (error) {
    console.error("AES key decryption error:", error)
    throw new Error("Failed to decrypt AES key")
  }
}

const splitIntoChunks = (message: string): string[] => {
  const chunks = []
  for (let i = 0; i < message.length; i += CHUNK_SIZE) {
    const chunk = message.slice(i, i + CHUNK_SIZE)
    chunks.push(chunk)
  }
  return chunks
}

export const encryptMessage = async (message: string, publicKey: CryptoKey): Promise<string> => {
  try {
    const aesKey = await generateAESKey()
    const aesKeyString = await exportAESKey(aesKey)

    const { encrypted: encryptedMessage, iv } = await encryptWithAES(message, aesKey)

    const encryptedAESKey = await encryptAESKey(aesKeyString, publicKey)

    const payload = JSON.stringify({
      key: encryptedAESKey,
      iv: iv,
      data: encryptedMessage,
    })

    const chunks = splitIntoChunks(payload)
    return chunks.join(CHUNK_SEPARATOR)
  } catch (error) {
    console.error("Message encryption error:", error)
    throw new Error("Failed to encrypt message")
  }
}

export const decryptMessage = async (encryptedMessage: string, privateKey: CryptoKey): Promise<string> => {
  try {
    const fullPayload = encryptedMessage.split(CHUNK_SEPARATOR).join("")

    const { key: encryptedAESKey, iv, data: encryptedData } = JSON.parse(fullPayload)

    const aesKeyString = await decryptAESKey(encryptedAESKey, privateKey)
    const aesKey = await importAESKey(aesKeyString)

    return await decryptWithAES(encryptedData, iv, aesKey)
  } catch (error) {
    console.error("Message decryption error:", error)
    throw new Error("Failed to decrypt message")
  }
}

export const generateAndStoreKeys = async (): Promise<KeyPair> => {
  try {
    if (!window.crypto || !window.crypto.subtle) {
      throw new Error("Web Crypto API is not supported")
    }

    const keyPair = await generateKeyPair()
    const publicKeyString = await exportPublicKey(keyPair.publicKey)
    const privateKeyData = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey)
    const privateKeyString = arrayBufferToBase64(privateKeyData)

    const keyData: StoredKeyData = {
      publicKey: publicKeyString,
      privateKey: await encryptWithFingerprint(privateKeyString),
      timestamp: Date.now(),
    }

    sessionStorage.setItem("privyUsrKeys", JSON.stringify(keyData))
    return {
      publicKey: keyPair.publicKey,
      privateKey: keyPair.privateKey,
      publicKeyString,
    }
  } catch (error) {
    console.error("Key storage error:", error)
    throw new Error("Failed to store encryption keys")
  }
}

export const getKeysFromStorage = async (): Promise<KeyPair | null> => {
  try {
    const keyDataString = sessionStorage.getItem("privyUsrKeys")
    if (!keyDataString) return null

    const keyData: StoredKeyData = JSON.parse(keyDataString)
    if (Date.now() - keyData.timestamp > 30 * 60 * 1000) {
      sessionStorage.removeItem("privyUsrKeys")
      toast.error("Session expired. New keys generated.")
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
      return null
    }

    const decryptedPrivateKey = await decryptWithFingerprint(keyData.privateKey)
    const privateKeyData = base64ToArrayBuffer(decryptedPrivateKey)
    const privateKey = await window.crypto.subtle.importKey(
      "pkcs8",
      privateKeyData,
      { name: "RSA-OAEP", hash: "SHA-256" },
      true,
      ["decrypt"],
    )

    const publicKey = await importPublicKey(keyData.publicKey)
    return {
      privateKey,
      publicKey,
      publicKeyString: keyData.publicKey,
    }
  } catch (error) {
    console.error("Key retrieval error:", error)
    sessionStorage.removeItem("privyUsrKeys")
    return null
  }
}

export const checkAndRotateKeys = async (): Promise<KeyPair> => {
  const existingKeys = await getKeysFromStorage()
  if (!existingKeys) {
    return await generateAndStoreKeys()
  }
  return existingKeys
}

export const cleanupKeys = () => sessionStorage.removeItem("privyUsrKeys")

const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  try {
    const uint8Array = new Uint8Array(buffer)
    const chunks: string[] = []
    uint8Array.forEach((byte) => {
      chunks.push(String.fromCharCode(byte))
    })
    return btoa(chunks.join(""))
  } catch (error) {
    console.error("Base64 encoding error:", error)
    throw new Error("Failed to encode message")
  }
}

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  try {
    const binaryString = atob(base64.trim())
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  } catch (error) {
    console.error("Base64 decoding error:", error)
    throw new Error("Failed to decode message")
  }
}

const initializeKeys = async () => {
  try {
    await checkAndRotateKeys()
  } catch (error) {
    console.error("Failed to initialize keys:", error)
  }
}

const INACTIVITY_TIMEOUT = 5 * 60 * 1000
let inactivityTimer: NodeJS.Timeout

const resetInactivityTimer = () => {
  if (inactivityTimer) clearTimeout(inactivityTimer)
  inactivityTimer = setTimeout(() => {
    cleanupKeys()
    toast.error("Session ended due to 5 minutes of inactivity. New keys generated.")
    if (typeof window !== "undefined") {
      window.location.href = "/"
    }
  }, INACTIVITY_TIMEOUT)
}

const setupInactivityDetection = () => {
  ;["mousedown", "mousemove", "keypress", "scroll", "touchstart"].forEach((eventName) => {
    document.addEventListener(eventName, resetInactivityTimer)
  })
  resetInactivityTimer()
}

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    initializeKeys()
    setupInactivityDetection()
  })
  window.addEventListener("unload", () => {
    cleanupKeys()
    if (inactivityTimer) clearTimeout(inactivityTimer)
  })
}

