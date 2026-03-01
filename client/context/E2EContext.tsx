"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { getKeysApi, backupKeysApi } from "@/api/api";
import {
  generateKeyPair,
  encryptPrivateKey,
  decryptPrivateKey,
  deriveSharedSecret,
  encryptMessage,
  decryptMessage,
} from "@/utils/crypto";
import { Lock, KeyRound, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface E2EContextType {
  privateKey: JsonWebKey | null;
  publicKey: JsonWebKey | null;
  isE2EReady: boolean;
  encryptMsg: (
    msg: string,
    receiverPublicKey: JsonWebKey,
  ) => Promise<{ ciphertext: string; iv: string } | null>;
  decryptMsg: (
    encryptedData: { ciphertext: string; iv: string },
    senderPublicKey: JsonWebKey,
  ) => Promise<string | null>;
}

const E2EContext = createContext<E2EContextType | undefined>(undefined);

export const E2EProvider = ({ children }: { children: ReactNode }) => {
  const { user, token, isAuthenticated } = useAuth();

  const [privateKey, setPrivateKey] = useState<JsonWebKey | null>(null);
  const [publicKey, setPublicKey] = useState<JsonWebKey | null>(null);
  const [isE2EReady, setIsE2EReady] = useState(false);

  // UI States
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [promptMode, setPromptMode] = useState<"create" | "restore">("create");
  const [passwordInput, setPasswordInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [serverEncryptedKey, setServerEncryptedKey] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !token) {
      setPrivateKey(null);
      setPublicKey(null);
      setIsE2EReady(false);
      return;
    }

    const initE2E = async () => {
      // 1. If we already have the memory keys, we are ready.
      if (privateKey && publicKey) {
        setIsE2EReady(true);
        return;
      }

      // 2. Check SessionStorage (to survive page reloads but clear on browser close)
      const cachedPrivate = sessionStorage.getItem("e2e_private_key");
      const cachedPublic = sessionStorage.getItem("e2e_public_key");

      if (cachedPrivate && cachedPublic) {
        try {
          setPrivateKey(JSON.parse(cachedPrivate));
          setPublicKey(JSON.parse(cachedPublic));
          setIsE2EReady(true);
          return;
        } catch (e) {
          console.error("Failed to parse cached keys", e);
          sessionStorage.removeItem("e2e_private_key");
          sessionStorage.removeItem("e2e_public_key");
        }
      }

      // 3. Check if keys exist on server
      const serverKeys = await getKeysApi(user._id, token);

      if (serverKeys && serverKeys.encryptedPrivateKey) {
        // Keys exist on server! Do we have them in memory/session? No.
        // Prompt for restore
        setServerEncryptedKey(serverKeys);
        setPromptMode("restore");
        setShowPasswordPrompt(true);
      } else {
        // First time ever. Need to create keys!
        setPromptMode("create");
        setShowPasswordPrompt(true);
      }
    };

    initE2E();
  }, [isAuthenticated, user, token, privateKey, publicKey]);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput || !user || !token) return;
    setLoading(true);

    try {
      if (promptMode === "create") {
        const keys = await generateKeyPair();
        const encryptedData = await encryptPrivateKey(
          keys.privateKey,
          passwordInput,
        );

        await backupKeysApi(
          keys.publicKey,
          encryptedData.encryptedPrivateKey,
          encryptedData.iv,
          token,
        );

        setPrivateKey(keys.privateKey);
        setPublicKey(keys.publicKey);
        sessionStorage.setItem(
          "e2e_private_key",
          JSON.stringify(keys.privateKey),
        );
        sessionStorage.setItem(
          "e2e_public_key",
          JSON.stringify(keys.publicKey),
        );

        setShowPasswordPrompt(false);
        setIsE2EReady(true);
      } else {
        const decryptedKey = await decryptPrivateKey(
          {
            encryptedPrivateKey: serverEncryptedKey.encryptedPrivateKey,
            iv: serverEncryptedKey.iv,
          },
          passwordInput,
        );

        setPrivateKey(decryptedKey);
        setPublicKey(serverEncryptedKey.publicKey);
        sessionStorage.setItem("e2e_private_key", JSON.stringify(decryptedKey));
        sessionStorage.setItem(
          "e2e_public_key",
          JSON.stringify(serverEncryptedKey.publicKey),
        );

        setShowPasswordPrompt(false);
        setIsE2EReady(true);
        toast.success("Messages decrypted successfully!");
      }
    } catch (err) {
      toast.error("Incorrect password or error processing keys.");
    } finally {
      setLoading(false);
      setPasswordInput("");
    }
  };

  const encryptMsg = async (msg: string, receiverPublicKey: JsonWebKey) => {
    if (!privateKey) return null;
    try {
      const sharedSecret = await deriveSharedSecret(
        privateKey,
        receiverPublicKey,
      );
      return await encryptMessage(msg, sharedSecret);
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  };

  const decryptMsg = async (
    encryptedData: { ciphertext: string; iv: string },
    senderPublicKey: JsonWebKey,
  ) => {
    if (!privateKey) return null;
    try {
      const sharedSecret = await deriveSharedSecret(
        privateKey,
        senderPublicKey,
      );
      return await decryptMessage(encryptedData, sharedSecret);
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  };

  return (
    <E2EContext.Provider
      value={{
        privateKey,
        publicKey,
        isE2EReady,
        encryptMsg,
        decryptMsg,
      }}
    >
      {/* Encryption Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#2a3942] w-full max-w-md p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <div className="bg-[#00a884] p-4 rounded-full mb-6 relative">
              <Lock className="w-10 h-10 text-[#202c33]" />
              <KeyRound className="w-5 h-5 text-[#202c33] absolute -bottom-1 -right-1" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-100 mb-2 text-center">
              {promptMode === "create"
                ? "Set Encryption Password"
                : "Enter Encryption Password"}
            </h2>
            <p className="text-gray-400 text-center mb-6 text-sm">
              {promptMode === "create"
                ? "Create a secure password to backup your End-to-End Encryption keys. You will need this to restore your messages on a new device."
                : "Enter your secure password to restore your End-to-End Encryption keys and decrypt your conversations."}
            </p>

            <form onSubmit={handlePasswordSubmit} className="w-full">
              <input
                type="password"
                placeholder="Secure Password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="w-full p-4 bg-[#202c33] text-gray-100 border border-[#3b4a54] rounded-xl focus:outline-none focus:border-[#00a884] mb-4 placeholder-gray-500"
              />
              <button
                type="submit"
                disabled={loading || !passwordInput.trim()}
                className="w-full p-4 bg-[#00a884] hover:bg-[#008f6f] text-[#202c33] font-bold rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : promptMode === "create" ? (
                  "Create Backup & Continue"
                ) : (
                  "Restore Keys & Continue"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Only render children if we are not blocking with creating a new account */}
      {/* Actually we can render children behind the modal, but E2E might not be ready yet */}
      {children}
    </E2EContext.Provider>
  );
};

export const useE2E = () => {
  const context = useContext(E2EContext);
  if (context === undefined) {
    throw new Error("useE2E must be used within an E2EProvider");
  }
  return context;
};
