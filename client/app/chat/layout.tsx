"use client";

import SideBar from "@/components/SideBar";
import { usePathname } from "next/navigation";

export default function ChatLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isChatSelectionPage = pathname === "/chat";

  return (
    <div className="flex flex-1">
      {!isChatSelectionPage && <SideBar />}
      <div className="flex-1 flex flex-col">{children}</div>
    </div>
  );
}
