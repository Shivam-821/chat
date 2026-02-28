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
    setShowRightSide(false);
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
