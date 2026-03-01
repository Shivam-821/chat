export async function generateKeyPair() {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"],
  );

  const publicKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey,
  );
  const privateKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  );

  return { publicKey, privateKey };
}

export async function derivePasswordKey(password: string) {
  const enc = new TextEncoder();
  const baseKey = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode("chat-app-salt-12345"),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
}

export async function encryptPrivateKey(
  privateKeyJwk: JsonWebKey,
  password: string,
) {
  const key = await derivePasswordKey(password);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    new TextEncoder().encode(JSON.stringify(privateKeyJwk)),
  );

  return {
    encryptedPrivateKey: Array.from(new Uint8Array(encrypted)),
    iv: Array.from(iv),
  };
}

export async function decryptPrivateKey(
  data: { encryptedPrivateKey: number[]; iv: number[] },
  password: string,
) {
  const key = await derivePasswordKey(password);

  const decrypted = await window.crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: new Uint8Array(data.iv),
    },
    key,
    new Uint8Array(data.encryptedPrivateKey),
  );

  return JSON.parse(new TextDecoder().decode(decrypted)) as JsonWebKey;
}

export async function deriveSharedSecret(
  privateKeyJwk: JsonWebKey,
  publicKeyJwk: JsonWebKey,
) {
  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    privateKeyJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    ["deriveKey"],
  );

  const publicKey = await window.crypto.subtle.importKey(
    "jwk",
    publicKeyJwk,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );

  return window.crypto.subtle.deriveKey(
    {
      name: "ECDH",
      public: publicKey,
    },
    privateKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptMessage(
  message: string,
  sharedSecretKey: CryptoKey,
) {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(message);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    sharedSecretKey,
    encoded,
  );

  return {
    ciphertext: arrayBufferToBase64(encrypted),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

export async function decryptMessage(
  encryptedData: { ciphertext: string; iv: string },
  sharedSecretKey: CryptoKey,
) {
  const iv = base64ToArrayBuffer(encryptedData.iv);
  const ciphertext = base64ToArrayBuffer(encryptedData.ciphertext);

  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(iv) },
    sharedSecretKey,
    new Uint8Array(ciphertext),
  );

  return new TextDecoder().decode(decrypted);
}
