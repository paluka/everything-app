export const encryptMessage = async (
  publicKeyBase64: string,
  message: string
): Promise<string> => {
  // Decode the base64 public key into an ArrayBuffer
  const publicKeyBuffer = Uint8Array.from(atob(publicKeyBase64), (char) =>
    char.charCodeAt(0)
  );

  // Import the public key into a CryptoKey object
  const publicKey = await window.crypto.subtle.importKey(
    "spki", // The format of the public key
    publicKeyBuffer, // The key data
    {
      name: "RSA-OAEP",
      hash: { name: "SHA-256" }, // The hash algorithm used during key generation
    },
    false, // Key is not extractable
    ["encrypt"] // Usages for the public key
  );

  // Encode the message into an ArrayBuffer
  const messageBuffer = new TextEncoder().encode(message);

  // Encrypt the message using the public key
  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: "RSA-OAEP",
    },
    publicKey, // The CryptoKey object
    messageBuffer // The message to encrypt
  );

  // Convert the encrypted ArrayBuffer to a base64 string for easier storage/transfer
  const encryptedBase64 = btoa(
    String.fromCharCode(...new Uint8Array(encryptedBuffer))
  );

  return encryptedBase64;
};
