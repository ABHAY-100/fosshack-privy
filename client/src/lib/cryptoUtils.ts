const checkCryptoSupport = () => {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    throw new Error('Web Crypto API is not supported in this environment');
  }
};

interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

const generateKeyPair = async (): Promise<CryptoKeyPair> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256'
    },
    true,
    ['encrypt', 'decrypt']
  );
};

const storeKeys = async (keyPair: CryptoKeyPair) => {
  const exportedPublicKey = await window.crypto.subtle.exportKey('spki', keyPair.publicKey);
  const exportedPrivateKey = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  
  const timestamp = Date.now();
  sessionStorage.setItem('keyedin_publickey', 
    btoa(String.fromCharCode(...new Uint8Array(exportedPublicKey)))
  );
  sessionStorage.setItem('keyedin_privatekey',
    btoa(String.fromCharCode(...new Uint8Array(exportedPrivateKey)))
  );
  sessionStorage.setItem('keyedin_timestamp', timestamp.toString());
};

const shouldRotateKeys = (): boolean => {
  const timestamp = sessionStorage.getItem('keyedin_timestamp');
  if (!timestamp) return true;
  
  const KEY_ROTATION_INTERVAL = 60 * 60 * 1000;
  return (Date.now() - parseInt(timestamp, 10)) > KEY_ROTATION_INTERVAL;
};

export const getKeysFromStorage = async (): Promise<KeyPair | null> => {
  try {
    const publicKeyString = sessionStorage.getItem('keyedin_publickey');
    const privateKeyString = sessionStorage.getItem('keyedin_privatekey');
    
    if (!publicKeyString || !privateKeyString) return null;

    const publicKeyData = Uint8Array.from(atob(publicKeyString), c => c.charCodeAt(0));
    const privateKeyData = Uint8Array.from(atob(privateKeyString), c => c.charCodeAt(0));

    const [publicKey, privateKey] = await Promise.all([
      window.crypto.subtle.importKey(
        'spki',
        publicKeyData,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['encrypt']
      ),
      window.crypto.subtle.importKey(
        'pkcs8',
        privateKeyData,
        {
          name: 'RSA-OAEP',
          hash: 'SHA-256'
        },
        true,
        ['decrypt']
      )
    ]);

    return { publicKey, privateKey };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to import keys: ${error.message}`);
    }
    throw error;
  }
};

export const generateAndStoreKeys = async (): Promise<KeyPair> => {
  checkCryptoSupport();
  const keyPair = await generateKeyPair();
  await storeKeys(keyPair);
  return keyPair;
};

export const checkAndRotateKeys = async (): Promise<KeyPair> => {
  if (shouldRotateKeys()) {
    cleanupKeys();
    return await generateAndStoreKeys();
  }

  const existingKeys = await getKeysFromStorage();
  if (!existingKeys) {
    return await generateAndStoreKeys();
  }

  return existingKeys;
};

export const cleanupKeys = () => {
  sessionStorage.removeItem('keyedin_privatekey');
  sessionStorage.removeItem('keyedin_publickey');
  sessionStorage.removeItem('keyedin_timestamp');
};

// Convert string to ArrayBuffer for encryption
const str2ab = (str: string): ArrayBuffer => {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer as ArrayBuffer;
};

// Convert ArrayBuffer to string after decryption
const ab2str = (buf: ArrayBuffer): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buf);
};

export const encryptMessage = async (message: string, recipientPublicKey: CryptoKey): Promise<string> => {
  checkCryptoSupport();
  
  if (!message) {
    throw new Error('Message cannot be empty');
  }

  try {
    const messageBuffer = str2ab(message);
    const encryptedData = await window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      recipientPublicKey,
      messageBuffer
    );
    return btoa(String.fromCharCode(...new Uint8Array(encryptedData)));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
    throw error;
  }
};

export const decryptMessage = async (encryptedMessage: string, privateKey: CryptoKey): Promise<string> => {
  checkCryptoSupport();
  
  if (!encryptedMessage) {
    throw new Error('Encrypted message cannot be empty');
  }

  try {
    const encryptedData = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
    const decryptedData = await window.crypto.subtle.decrypt(
      { name: 'RSA-OAEP' },
      privateKey,
      encryptedData
    );
    return ab2str(decryptedData);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
    throw error;
  }
};

// Event listeners with proper cleanup
if (typeof window !== 'undefined') {
  const initKeys = () => checkAndRotateKeys().catch(error => {
    console.error('Failed to initialize keys:', error);
  });
  
  window.addEventListener('load', initKeys);
  window.addEventListener('unload', cleanupKeys);
}
