"use client";
import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { usePathname } from "next/navigation";

interface MobileLayoutContextType {
  showRightSide: boolean;
  setShowRightSide: (show: boolean) => void;
}

const MobileLayoutContext = createContext<MobileLayoutContextType | undefined>(
  undefined,
);

export const MobileLayoutProvider = ({ children }: { children: ReactNode }) => {
  const [showRightSide, setShowRightSide] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // Only reset to sidebar view when navigating to a top-level selection page
    // (e.g., /chat, /chat/group, /chat/individual landing pages)
    // Don't reset when navigating deeper into a chat (e.g., /chat/group/[id]/info)
    const isTopLevelChatPage =
      pathname === "/chat" ||
      pathname === "/chat/group" ||
      pathname === "/chat/individual";

    if (isTopLevelChatPage) {
      setShowRightSide(false);
    }
  }, [pathname]);

  return (
    <MobileLayoutContext.Provider value={{ showRightSide, setShowRightSide }}>
      {children}
    </MobileLayoutContext.Provider>
  );
};

export const useMobileLayout = () => {
  const context = useContext(MobileLayoutContext);
  if (context === undefined) {
    throw new Error(
      "useMobileLayout must be used within a MobileLayoutProvider",
    );
  }
  return context;
};
