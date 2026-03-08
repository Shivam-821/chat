import React from "react";
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";

export const metadata = {
  title: "Privacy Policy | Chat",
  description:
    "Read the Privacy Policy for Chat! Learn how we secure your data.",
};

const PrivacyPolicyPage = () => {
  return (
    <div className="flex flex-col items-center justify-center grow p-6 overflow-hidden relative">
      <div className="max-w-4xl w-full space-y-12 relative z-10 py-10">
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider text-black dark:text-white drop-shadow-[5px_5px_0_#facc15] dark:drop-shadow-[5px_5px_0_#10b981] uppercase leading-tight transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            Privacy{" "}
            <span className="text-yellow-500 dark:text-emerald-400">
              Policy
            </span>
          </h1>
          <p className="mt-6 text-xl font-bold bg-lime-200 dark:bg-neutral-800 text-black dark:text-white inline-block px-6 py-2 rounded-xl border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transform rotate-1">
            Last Updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-neutral-800 p-8 md:p-10 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] space-y-8 text-black dark:text-neutral-200">
          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-yellow-400 dark:border-emerald-400 pb-2 inline-block">
              1. Introduction
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              Welcome to Chat! We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy governs
              the privacy policies and practices of our application. If you have
              any questions or concerns about this privacy notice or our
              practices with regard to your personal information, please contact
              us.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-rose-400 dark:border-rose-400 pb-2 inline-block">
              2. Information We Collect
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              We collect personal information that you voluntarily provide to us
              when you register on the application, express an interest in
              obtaining information about us or our products and services, or
              when you contact us. This may include:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg font-medium ml-4">
              <li>Names and usernames</li>
              <li>Email addresses</li>
              <li>
                Passwords (stored securely using strong hashing algorithms)
              </li>
              <li>Profile avatars or pictures</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-blue-400 dark:border-blue-400 pb-2 inline-block">
              3. Data Encryption
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              <strong>End-to-End Encryption:</strong> Your messages and
              communication privacy are our top priority. All personal and group
              chat communications on Chat! are secured using advanced End-to-End
              Encryption (E2EE). This means that only you and the person(s) you
              are communicating with can read or listen to them. We cannot read
              your messages.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-purple-400 dark:border-purple-400 pb-2 inline-block">
              4. How We Use Your Information
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              We use the information we collect or receive to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg font-medium ml-4">
              <li>Facilitate account creation and authentication.</li>
              <li>
                Provide and deliver the services you requested (e.g., messaging,
                video/audio calls).
              </li>
              <li>Respond to user inquiries/offer support to users.</li>
              <li>Enforce our terms, conditions, and policies.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-amber-400 dark:border-amber-400 pb-2 inline-block">
              5. Sharing Your Information
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              We only share information with your consent, to comply with laws,
              to provide you with services, to protect your rights, or to
              fulfill business obligations. We absolutely{" "}
              <strong>do not</strong> sell your personal information to third
              parties.
            </p>
          </section>
        </div>

        {/* Contact Section */}
        <div className="bg-lime-300 dark:bg-neutral-900 p-8 md:p-10 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform lg:rotate-1 hover:rotate-0 transition-transform duration-300 space-y-6 relative mt-16">
          <div className="absolute -top-6 -right-6 bg-yellow-400 dark:bg-amber-500 border-4 border-black dark:border-white px-4 py-2 font-black text-xl rounded-xl rotate-12 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
            Reach Out!
          </div>

          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide border-b-4 border-cyan-400 dark:border-cyan-500 pb-2 inline-block">
            Questions or Queries?
          </h2>

          <p className="text-lg md:text-xl font-medium text-black dark:text-neutral-100 mt-4 leading-relaxed">
            If you have questions or comments about this Privacy Policy, or if
            you are interested in collaboration, please feel free to reach out
            directly via email.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center">
            <a
              href="mailto:shivamraj1109.23@gmail.com"
              className="flex items-center gap-3 px-8 py-4 font-bold text-lg md:text-xl text-black dark:text-white border-4 border-black dark:border-white rounded-2xl bg-cyan-400 hover:bg-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-500 hover:-translate-y-2 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none w-full sm:w-auto"
            >
              <FaEnvelope size={24} />
              shivamraj1109.23@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
