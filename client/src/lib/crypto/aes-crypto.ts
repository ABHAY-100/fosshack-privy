export const generateAESKey = async (): Promise<CryptoKey> => {
  return await window.crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
};

export const exportAESKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(exported)));
};

export const importAESKey = async (keyStr: string): Promise<CryptoKey> => {
  const keyData = Uint8Array.from(atob(keyStr), c => c.charCodeAt(0));
  return await window.crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "AES-GCM" },
    true,
    ["encrypt", "decrypt"]
  );
};

export const encryptWithAES = async (message: string, key: CryptoKey): Promise<{ encrypted: string, iv: string }> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encrypted = await window.crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    data
  );

  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
};

export const decryptWithAES = async (encryptedData: string, iv: string, key: CryptoKey): Promise<string> => {
  const encryptedBytes = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: ivBytes
    },
    key,
    encryptedBytes
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
};
