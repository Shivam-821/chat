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

      // 2. Check localStorage (to survive page reloads but clear on browser close)
      const cachedPrivate = localStorage.getItem("e2e_private_key");
      const cachedPublic = localStorage.getItem("e2e_public_key");

      if (cachedPrivate && cachedPublic) {
        try {
          setPrivateKey(JSON.parse(cachedPrivate));
          setPublicKey(JSON.parse(cachedPublic));
          setIsE2EReady(true);
          return;
        } catch (e) {
          console.error("Failed to parse cached keys", e);
          localStorage.removeItem("e2e_private_key");
          localStorage.removeItem("e2e_public_key");
        }
      }

      // 3. Check if keys exist on server
      const serverKeys = await getKeysApi(user._id, token);

      if (serverKeys && serverKeys.encryptedPrivateKey) {
        // Keys exist on server! Do we have them in memory/localStorage? No.
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
        localStorage.setItem(
          "e2e_private_key",
          JSON.stringify(keys.privateKey),
        );
        localStorage.setItem(
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
        localStorage.setItem("e2e_private_key", JSON.stringify(decryptedKey));
        localStorage.setItem(
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-neutral-800 w-full max-w-md p-8 rounded-3xl border-[3px] border-slate-800 dark:border-neutral-700 shadow-[8px_8px_0_0_rgba(30,41,59,1)] dark:shadow-[8px_8px_0_0_rgba(23,23,23,1)] flex flex-col items-center relative overflow-hidden">
            {/* Playful Background Elements */}
            <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-amber-300/20 dark:bg-amber-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-32 h-32 bg-emerald-300/20 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-2xl opacity-60 pointer-events-none"></div>

            <div className="bg-emerald-100 dark:bg-emerald-900/30 p-5 rounded-full mb-6 relative border-2 border-emerald-500/30 shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
              <Lock className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
              <div className="absolute -bottom-2 -right-2 bg-white dark:bg-neutral-800 rounded-full p-1.5 border border-slate-200 dark:border-neutral-700 shadow-sm">
                <KeyRound className="w-5 h-5 text-amber-500" />
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-3 text-center tracking-tight">
              {promptMode === "create"
                ? "Secure Your Chats"
                : "Unlock Your Chats"}
            </h2>
            <p className="text-slate-500 dark:text-neutral-400 font-medium text-center mb-8 text-sm leading-relaxed px-2">
              {promptMode === "create"
                ? "Create a powerful password to encrypt your conversations. Keep it safe to restore your messages on a new device."
                : "Enter your secure password to restore your End-to-End Encryption keys and access your conversations."}
            </p>

            <form
              onSubmit={handlePasswordSubmit}
              className="w-full flex flex-col gap-5 relative z-10"
            >
              <div className="relative">
                <input
                  type="password"
                  placeholder="Encryption Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                  className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 focus:border-emerald-500 dark:focus:border-emerald-400 text-slate-800 dark:text-slate-200 rounded-xl pl-4 pr-4 py-3 focus:outline-none transition-colors font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] placeholder-slate-400 dark:placeholder-neutral-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !passwordInput.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white dark:text-slate-900 font-black text-lg py-4 rounded-xl border-2 border-transparent dark:border-emerald-600 shadow-[4px_4px_0_0_rgba(16,185,129,0.5)] dark:shadow-[4px_4px_0_0_rgba(4,120,87,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(16,185,129,0.5)] dark:hover:shadow-[2px_2px_0_0_rgba(4,120,87,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : promptMode === "create" ? (
                  "Enable Encryption"
                ) : (
                  "Unlock Conversations"
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
