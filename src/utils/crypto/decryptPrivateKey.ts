import CryptoJS from "crypto-js";

export const decryptPrivateKey = async (
  encryptedPrivateKey: string,
  secret: string
): Promise<CryptoKey> => {
  // Decrypt the private key using the secret
  const decryptedBase64 = CryptoJS.AES.decrypt(
    encryptedPrivateKey,
    secret
  ).toString(CryptoJS.enc.Utf8);

  // Convert the base64 string back to an ArrayBuffer
  const privateKeyBuffer = Uint8Array.from(atob(decryptedBase64), (char) =>
    char.charCodeAt(0)
  );

  // Import the private key into a CryptoKey object
  const privateKey = await window.crypto.subtle.importKey(
    "pkcs8", // The format of the private key
    privateKeyBuffer, // The key data
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" },
    },
    true, // The key is extractable (can be used for decryption)
    ["decrypt"] // Usages for the private key
  );

  return privateKey;
};
