import React from "react";
import Link from "next/link";
import { FaEnvelope } from "react-icons/fa";

export const metadata = {
  title: "Terms & Conditions | Chat",
  description:
    "Read the Terms and Conditions for Chat! Understand the rules and guidelines for using our platform.",
};

const TermsConditionPage = () => {
  return (
    <div className="flex flex-col items-center justify-center grow p-6 overflow-hidden relative">
      <div className="max-w-4xl w-full space-y-12 relative z-10 py-10">
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider text-black dark:text-white drop-shadow-[5px_5px_0_#facc15] dark:drop-shadow-[5px_5px_0_#10b981] uppercase leading-tight transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            Terms{" "}
            <span className="text-yellow-500 dark:text-emerald-400">&</span>{" "}
            Conditions
          </h1>
          <p className="mt-6 text-xl font-bold bg-lime-200 dark:bg-neutral-800 text-black dark:text-white inline-block px-6 py-2 rounded-xl border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transform rotate-1">
            Effective Date:{" "}
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
              1. Acceptance of Terms
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              By accessing, registering for, or using the Chat! website and
              application, you agree to be bound by these Terms and Conditions.
              If you do not agree with any part of these terms, you must not use
              our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-rose-400 dark:border-rose-400 pb-2 inline-block">
              2. User Accounts
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              To use certain features of the platform, you must create an
              account. You are responsible for maintaining the confidentiality
              of your account credentials (including passwords) and for all
              activities that occur under your account. You agree to notify us
              immediately of any unauthorized use of your account.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-blue-400 dark:border-blue-400 pb-2 inline-block">
              3. Acceptable Use Policy
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              You agree not to use the platform to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-lg font-medium ml-4">
              <li>
                Violate any local, state, national, or international law or
                regulation.
              </li>
              <li>
                Harass, abuse, insult, harm, defame, slander, disparage,
                intimidate, or discriminate based on gender, sexual orientation,
                religion, ethnicity, race, age, national origin, or disability.
              </li>
              <li>
                Upload or transmit viruses, malware, or any other type of
                malicious code.
              </li>
              <li>
                Spam, phish, pharm, pretext, spider, crawl, or scrape the
                service.
              </li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-purple-400 dark:border-purple-400 pb-2 inline-block">
              4. Modifications to the Service and Prices
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              We reserve the right at any time to modify or discontinue the
              Service (or any part or content thereof) without notice at any
              time. We shall not be liable to you or to any third-party for any
              modification, suspension, or discontinuance of the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-wide border-b-4 border-amber-400 dark:border-amber-400 pb-2 inline-block">
              5. Limitation of Liability
            </h2>
            <p className="text-lg font-medium leading-relaxed">
              In no case shall Chat!, our directors, officers, employees,
              affiliates, agents, contractors, interns, suppliers, service
              providers, or licensors be liable for any injury, loss, claim, or
              any direct, indirect, incidental, punitive, special, or
              consequential damages of any kind arising from your use of any of
              the service or any products procured using the service.
            </p>
          </section>
        </div>

        {/* Contact Section */}
        <div className="bg-lime-300 dark:bg-neutral-900 p-8 md:p-10 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform lg:rotate-1 hover:rotate-0 transition-transform duration-300 space-y-6 relative mt-16">
          <div className="absolute -top-6 -right-6 bg-yellow-400 dark:bg-amber-500 border-4 border-black dark:border-white px-4 py-2 font-black text-xl rounded-xl -rotate-12 shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff]">
            Connect!
          </div>

          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide border-b-4 border-cyan-400 dark:border-cyan-500 pb-2 inline-block">
            Collaboration & Inquiries
          </h2>

          <p className="text-lg md:text-xl font-medium text-black dark:text-neutral-100 mt-4 leading-relaxed">
            Have questions regarding our Terms, or looking to discuss a business
            idea, software collaboration, or development project? Reach out
            directly to the creator!
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

export default TermsConditionPage;
