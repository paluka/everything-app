import * as CryptoJS from "crypto-js";

export async function generateKeyPair(
  secret: string
): Promise<{ encryptedPrivateKey: string; publicKeyBase64: string }> {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
      hash: { name: "SHA-256" },
    },
    true, // Can be used for encryption and decryption
    ["encrypt", "decrypt"]
  );

  // Export keys
  const privateKey = await window.crypto.subtle.exportKey(
    "pkcs8",
    keyPair.privateKey
  );
  const publicKey = await window.crypto.subtle.exportKey(
    "spki",
    keyPair.publicKey
  );

  // Convert keys to base64 for storage
  const privateKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(privateKey))
  );
  const publicKeyBase64 = btoa(
    String.fromCharCode(...new Uint8Array(publicKey))
  );

  const encryptedPrivateKey = CryptoJS.AES.encrypt(
    privateKeyBase64,
    secret
  ).toString();

  return { encryptedPrivateKey, publicKeyBase64 };
}
