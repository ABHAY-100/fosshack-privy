export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
  publicKeyString?: string;
}

export interface StoredKeyData {
  publicKey: string;
  privateKey: string;
  timestamp: number;
}
