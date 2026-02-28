import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import ThemeContext from "@/context/ThemeContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "react-hot-toast";

const comicNeue = Comic_Neue({
  variable: "--font-comic-neue",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export const metadata: Metadata = {
  title: "Chat| Fun along with Security",
  description:
    "Chat with your friends and family in a fun and secure environment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${comicNeue.variable} font-sans antialiased flex flex-col min-h-screen bg-lime-50 dark:bg-neutral-950`}
        style={{ fontFamily: "var(--font-comic-neue)" }}
      >
        <ThemeContext>
          <SocketProvider>
            <AuthProvider>
              <NavBar />
              <main className="grow flex flex-col w-full">{children}</main>
              <Footer />
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    fontFamily: "var(--font-comic-neue)",
                    borderRadius: "16px",
                    fontWeight: "bold",
                  },
                  success: {
                    className:
                      "border-2 border-slate-800 bg-lime-100 dark:bg-lime-900 dark:text-lime-50 text-slate-800 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                    iconTheme: {
                      primary: "#1e293b",
                      secondary: "#d9f99d",
                    },
                  },
                  error: {
                    className:
                      "border-2 border-slate-800 bg-rose-200 dark:bg-rose-900 dark:text-rose-50 text-slate-800 shadow-[4px_4px_0_0_rgba(30,41,59,1)] dark:shadow-[4px_4px_0_0_rgba(0,0,0,1)]",
                    iconTheme: {
                      primary: "#1e293b",
                      secondary: "#fecdd3",
                    },
                  },
                }}
              />
            </AuthProvider>
          </SocketProvider>
        </ThemeContext>
      </body>
    </html>
  );
}
