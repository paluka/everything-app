export const decryptMessage = async (
  encryptedMessage: string,
  privateKey: CryptoKey
): Promise<string> => {
  // Decode the base64 string into an ArrayBuffer
  const encryptedBuffer = Uint8Array.from(atob(encryptedMessage), (char) =>
    char.charCodeAt(0)
  );

  // Decrypt the message using the private key
  const decryptedBuffer = await window.crypto.subtle.decrypt(
    {
      name: "RSA-OAEP",
    },
    privateKey, // The CryptoKey object
    encryptedBuffer // The encrypted message
  );

  // Convert the decrypted ArrayBuffer back to a string
  const decryptedMessage = new TextDecoder().decode(decryptedBuffer);

  return decryptedMessage;
};
