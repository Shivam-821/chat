"use client";

import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";
import {
  MobileLayoutProvider,
  useMobileLayout,
} from "@/context/MobileLayoutContext";
import { FaPlus } from "react-icons/fa";

const ChatLayoutInner = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isChatSelectionPage = pathname === "/chat";
  const { showRightSide, setShowRightSide } = useMobileLayout();

  return (
    <div className="flex flex-1 min-h-0 relative overflow-hidden">
      {!isChatSelectionPage && (
        <div
          className={`
          ${showRightSide ? "hidden md:block" : "w-full md:w-auto"}
          md:shrink-0 transition-all duration-300 relative
        `}
        >
          <SideBar />
          {/* Add FAB for mobile when right side is hidden */}
          {!showRightSide && (
            <button
              onClick={() => setShowRightSide(true)}
              className="md:hidden fixed bottom-8 right-6 z-50 flex items-center justify-center w-14 h-14 bg-lime-400 hover:bg-lime-500 dark:bg-lime-500 dark:hover:bg-lime-600 text-black border-2 border-black dark:border-white dark:text-white rounded-full 
              shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] 
              hover:-translate-y-1 hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[6px_6px_0_0_rgba(255,255,255,1)] 
              active:translate-y-1 active:shadow-[0px_0px_0_0_rgba(0,0,0,1)] dark:active:shadow-[0px_0px_0_0_rgba(255,255,255,1)]
              transition-all group"
              aria-label="Add new"
            >
              <FaPlus
                size={24}
                className="group-hover:rotate-90 transition-transform duration-300"
              />
            </button>
          )}
        </div>
      )}
      <div
        className={`
        flex-1 min-h-0 flex flex-col 
        ${!isChatSelectionPage && !showRightSide ? "hidden md:flex" : "w-full"}
      `}
      >
        {children}
      </div>
    </div>
  );
};

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileLayoutProvider>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </MobileLayoutProvider>
  );
}
