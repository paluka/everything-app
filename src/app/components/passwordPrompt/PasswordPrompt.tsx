import { useRef, useState } from "react";
import * as CryptoJS from "crypto-js";

import logger from "@/utils/logger";
import { useSessionUserProfileContext } from "@/app/hooks/useSessionUserProfileContext";

import passwordPromptStyles from "./passwordPrompt.module.scss";

function PasswordPrompt() {
  const hasFetchedRef = useRef(false);
  const [passwordContent, setPasswordContent] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    isPasswordPromptVisible,
    setIsPasswordPromptVisible,
    sessionUserProfile,
    setSessionUserProfile,
  } = useSessionUserProfileContext();

  async function generateKeyPair(
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (hasFetchedRef.current || !sessionUserProfile || !passwordContent) {
      return;
    }

    try {
      hasFetchedRef.current = true;
      setError("");

      const { encryptedPrivateKey, publicKeyBase64 } = await generateKeyPair(
        passwordContent
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${sessionUserProfile.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            publicKey: publicKeyBase64,
            encryptedPrivateKey,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user profile from prompt");
      }

      const newUserProfile = await response.json();
      setSessionUserProfile(newUserProfile);
      // logger.log(`Response from updating user profile from prompt`, response);
      // const data = await response.json();
      // logger.log(`Create post response: ${JSON.stringify(data)}`);

      if (newUserProfile.publicKey) {
        setIsPasswordPromptVisible(false);
      }
    } catch (error) {
      const errorString = `User profile update error: ${error}`;
      setError(errorString);
      logger.error(errorString);
    } finally {
      setPasswordContent("");
    }
  };

  return !isPasswordPromptVisible || !sessionUserProfile ? (
    <></>
  ) : (
    <div className={passwordPromptStyles.passwordPromptContainer}>
      <div className={passwordPromptStyles.title}>
        Enter a password to enable end-to-end encrypted messaging
      </div>
      <form
        className={passwordPromptStyles.inputAndButtonContainer}
        onSubmit={(event) => {
          handleSubmit(event);
        }}
      >
        <div className={passwordPromptStyles.textInputContainer}>
          <input
            readOnly
            value={sessionUserProfile.email}
            autoComplete="username"
            hidden
          />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter a password"
            autoComplete="new-password"
            value={passwordContent}
            onChange={(e) => setPasswordContent(e.target.value)}
            onKeyDown={(event) =>
              event.key === "Enter" ? handleSubmit(event) : null
            }
          />
          <div
            className={passwordPromptStyles.showPassword}
            onClick={() => setShowPassword(!showPassword)}
            aria-label="Toggle password visibility"
          >
            {showPassword ? (
              // Open eye icon (SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <title>open-eye</title>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zM1 12s3-7 11-7 11 7 11 7-3 7-11 7S1 12 1 12z"
                />
              </svg>
            ) : (
              // Closed eye icon (SVG)
              <svg
                xmlns="http://www.w3.org/2000/svg"
                id="Layer_1"
                data-name="Layer 1"
                viewBox="0 0 122.88 53.37"
                width="20"
                height="20"
              >
                <title>closed-eye</title>
                <path
                  d="M1.05,7.37A4.49,4.49,0,1,1,7.93,1.61a114.61,114.61,0,0,0,14.88,15C35.48,27,48.63,32.25,61.67,32.24S87.79,27,100.37,16.49A112.38,112.38,0,0,0,114.94,1.64a4.48,4.48,0,0,1,6.92,5.69,129.09,129.09,0,0,1-10,10.85l5.91,5.42a4.47,4.47,0,1,1-6,6.6l-6.59-6a86.1,86.1,0,0,1-13.43,9.06l3.73,8A4.48,4.48,0,0,1,87.35,45l-3.74-8a61.24,61.24,0,0,1-17.56,4V48.9a4.48,4.48,0,0,1-8.95,0V41A61.75,61.75,0,0,1,39.58,37l-3.76,8a4.48,4.48,0,1,1-8.11-3.79l3.74-8A88.78,88.78,0,0,1,18,24.2l-6.55,6a4.47,4.47,0,1,1-6-6.6l5.83-5.34A130.63,130.63,0,0,1,1.05,7.37Z"
                  fill="#FFF"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
            )}
          </div>
        </div>
        <button onClick={handleSubmit}>Submit</button>
      </form>
      <div className={passwordPromptStyles.errorContainer}>{error}</div>
    </div>
  );
}

export default PasswordPrompt;
