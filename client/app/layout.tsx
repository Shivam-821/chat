import type { Metadata } from "next";
import { Comic_Neue } from "next/font/google";
import "./globals.css";
import ThemeContext from "@/context/ThemeContext";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";

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
          <AuthProvider>
            <NavBar />
            <main className="grow flex flex-col w-full">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeContext>
      </body>
    </html>
  );
}
