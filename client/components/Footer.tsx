"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { FaGithub, FaDiscord } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const pathname = usePathname();

  // Hide the footer entirely on chat pages and video calls so it doesn't squish the layout
  if (pathname.startsWith("/chat") || pathname.startsWith("/video")) {
    return null;
  }

  return (
    <footer className="bg-lime-100 dark:bg-neutral-900 border-t border-lime-200 dark:border-neutral-800 py-8 px-5 mt-auto w-full z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <h2 className="text-3xl font-bold tracking-wider hover:scale-105 transition-transform cursor-default">
            Chat
          </h2>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 text-center md:text-left">
            Connect with friends in a fun and secure way!
          </p>
        </div>

        <div className="flex flex-wrap justify-center md:justify-end gap-6 text-base font-bold text-slate-700 dark:text-slate-300">
          <Link
            href="/about"
            className="hover:text-amber-500 dark:hover:text-slate-50 hover:-translate-y-1 transition-transform"
          >
            About
          </Link>
          <Link
            href="/privacy-policy"
            className="hover:text-amber-500 dark:hover:text-slate-50 hover:-translate-y-1 transition-transform"
          >
            Privacy
          </Link>
          <Link
            href="/terms-condition"
            className="hover:text-amber-500 dark:hover:text-slate-50 hover:-translate-y-1 transition-transform"
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className="hover:text-amber-500 dark:hover:text-slate-50 hover:-translate-y-1 transition-transform"
          >
            Contact
          </Link>
        </div>

        <div className="flex gap-4">
          <a
            href="#"
            className="p-3 bg-lime-200 dark:bg-neutral-800 rounded-full hover:bg-yellow-400 dark:hover:bg-white hover:text-black transition-all hover:scale-110 shadow-sm hover:shadow-md hover:-rotate-12 cursor-pointer"
          >
            <FaXTwitter size={24} />
          </a>
          <a
            href="#"
            className="p-3 bg-lime-200 dark:bg-neutral-800 rounded-full hover:bg-yellow-400 dark:hover:bg-white hover:text-black transition-all hover:scale-110 shadow-sm hover:shadow-md hover:rotate-12 cursor-pointer"
          >
            <FaDiscord size={24} />
          </a>
          <a
            href="#"
            className="p-3 bg-lime-200 dark:bg-neutral-800 rounded-full hover:bg-yellow-400 dark:hover:bg-white hover:text-black transition-all hover:scale-110 shadow-sm hover:shadow-md hover:-rotate-12 cursor-pointer"
          >
            <FaGithub size={24} />
          </a>
        </div>
      </div>
      <div className="mt-8 pt-4 border-t border-lime-200 dark:border-neutral-800 text-sm font-bold text-slate-500 dark:text-slate-500 flex items-center justify-center gap-2">
        <span className="pt-1">&copy;</span> {new Date().getFullYear()} Chat
        App. Let&apos;s talk!
      </div>
    </footer>
  );
};

export default Footer;
