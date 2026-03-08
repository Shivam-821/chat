import React from "react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

export const metadata = {
  title: "About Us | Chat",
  description: "Learn more about Chat! and its creator Shivam Raj.",
};

const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center grow p-6 overflow-hidden relative">
      <div className="max-w-4xl w-full space-y-12 relative z-10 py-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider text-black dark:text-white drop-shadow-[5px_5px_0_#facc15] dark:drop-shadow-[5px_5px_0_#10b981] uppercase leading-tight transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            About{" "}
            <span className="text-yellow-500 dark:text-emerald-400">Chat!</span>
          </h1>
          <p className="mt-6 text-xl md:text-2xl font-bold bg-lime-200 dark:bg-neutral-800 text-black dark:text-white inline-block px-6 py-2 rounded-xl border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transform rotate-1">
            Fun, Secure, and Built for You.
          </p>
        </div>

        {/* Application Features Section */}
        <div className="bg-white dark:bg-neutral-800 p-8 md:p-10 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform lg:-rotate-1 hover:rotate-0 transition-transform duration-300 space-y-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide border-b-4 border-yellow-400 dark:border-emerald-400 pb-4 inline-block">
            What is Chat?
          </h2>
          <p className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
            Chat! is not just another messaging app. It is a highly secure,
            tremendously fun, and ridiculously intuitive space to connect with
            your friends, family, and colleagues. We believe communication
            should be expressive, uninterrupted, and absolutely private!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <FeatureCard
              title="End-to-End Encryption"
              description="Your privacy is our number one priority. All messages are securely encrypted from end to end."
              colorClass="bg-red-200 dark:bg-red-900 border-red-500 dark:border-red-400"
            />
            <FeatureCard
              title="Individual & Group Chats"
              description="Secure individual messaging and robust group chat features for all your friends and communities."
              colorClass="bg-orange-200 dark:bg-orange-900 border-orange-500 dark:border-orange-400"
            />
            <FeatureCard
              title="Real-Time & Throttled Typing"
              description="Experience zero delay in messaging. Plus, real-time typing indicators optimized with advanced throttling."
              colorClass="bg-amber-200 dark:bg-amber-900 border-amber-500 dark:border-amber-400"
            />
            <FeatureCard
              title="Audio & Video Calls"
              description="Crystal clear audio calls and seamless video meetings via our optimized WebRTC integrations."
              colorClass="bg-blue-200 dark:bg-blue-900 border-blue-500 dark:border-blue-400"
            />
            <FeatureCard
              title="Time-Bound Message Editing"
              description="Made a typo? No sweat! You have a time window to edit your sent messages before they lock in."
              colorClass="bg-green-200 dark:bg-green-900 border-green-500 dark:border-green-400"
            />
            <FeatureCard
              title="Message Reactions"
              description="Express yourself playfully! React to any message with an assortment of expressive emojis."
              colorClass="bg-pink-200 dark:bg-pink-900 border-pink-500 dark:border-pink-400"
            />
            <FeatureCard
              title="Daily Task Tracker"
              description="Stay super productive with our built-in daily task tracker boasting a vast and great user experience."
              colorClass="bg-purple-200 dark:bg-purple-900 border-purple-500 dark:border-purple-400"
            />
            <FeatureCard
              title="Awesome Aesthetics"
              description="Enjoy a beautifully crafted, highly aesthetic, and slightly goofy UI matching your vibe."
              colorClass="bg-cyan-200 dark:bg-cyan-900 border-cyan-500 dark:border-cyan-400"
            />
          </div>
        </div>

        {/* Creator Section */}
        <div className="bg-lime-300 dark:bg-neutral-900 p-8 md:p-10 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform lg:rotate-1 hover:rotate-0 transition-transform duration-300 space-y-6 relative mt-16">
          <div className="absolute -top-6 -right-6 bg-yellow-400 dark:bg-amber-500 border-4 border-black dark:border-white px-4 py-2 font-black text-xl rounded-xl rotate-12 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
            The Creator!
          </div>

          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide border-b-4 border-rose-400 dark:border-rose-500 pb-4 inline-block">
            About the Developer
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-center md:items-start pt-4">
            <div className="flex-1 space-y-4 text-lg md:text-xl font-medium text-black dark:text-neutral-100">
              <p>
                Hi there! I&apos;m{" "}
                <span className="font-extrabold text-2xl underline decoration-wavy decoration-rose-500">
                  Shivam Raj
                </span>
                .
              </p>
              <p>
                I am a passionate software developer who loves building
                applications that are both highly functional and visually
                striking. Creating this platform was an exciting journey of
                combining robust technical solutions with an expressive, playful
                user interface.
              </p>
              <p>
                Whether it&apos;s crafting seamless frontend experiences or
                architecting reliable backend systems, I strive to push the
                boundaries of what the web can do.
              </p>
            </div>

            {/* Social Links */}
            <div className="w-full md:w-auto flex flex-col gap-4">
              <SocialLink
                href="https://www.rajshivam.in"
                icon={<FaGlobe size={24} />}
                label="Portfolio Website"
                customColor="bg-sky-400 hover:bg-sky-300 dark:bg-sky-600 dark:hover:bg-sky-500"
              />
              <SocialLink
                href="https://github.com/shivam-821"
                icon={<FaGithub size={24} />}
                label="GitHub: shivam-821"
                customColor="bg-slate-300 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600"
              />
              <SocialLink
                href="https://www.linkedin.com/in/shivamraj11"
                icon={<FaLinkedin size={24} />}
                label="LinkedIn: shivamraj11"
                customColor="bg-blue-400 hover:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable smaller components for the page
const FeatureCard = ({
  title,
  description,
  colorClass,
}: {
  title: string;
  description: string;
  colorClass: string;
}) => (
  <div
    className={`p-5 border-4 rounded-xl shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] ${colorClass} text-black dark:text-white hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all`}
  >
    <h3 className="font-bold text-xl mb-2">{title}</h3>
    <p className="font-medium text-sm md:text-base opacity-90">{description}</p>
  </div>
);

const SocialLink = ({
  href,
  icon,
  label,
  customColor,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  customColor: string;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-center gap-3 px-6 py-4 font-bold text-black dark:text-white border-4 border-black dark:border-white rounded-2xl ${customColor} hover:-translate-y-2 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none whitespace-nowrap`}
  >
    {icon}
    <span>{label}</span>
  </a>
);

export default AboutPage;
