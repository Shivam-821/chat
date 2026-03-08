import React from "react";
import { FaEnvelope, FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

export const metadata = {
  title: "Contact Us | Chat",
  description:
    "Get in touch with the creator of Chat! for any queries or collaborations.",
};

const ContactPage = () => {
  return (
    <div className="flex flex-col items-center justify-center grow p-6 overflow-hidden relative">
      <div className="max-w-4xl w-full space-y-12 relative z-10 py-10 flex flex-col items-center">
        {/* Title Section */}
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-black tracking-wider text-black dark:text-white drop-shadow-[5px_5px_0_#facc15] dark:drop-shadow-[5px_5px_0_#10b981] uppercase leading-tight transform -rotate-1 hover:rotate-0 transition-transform duration-300">
            Contact{" "}
            <span className="text-yellow-500 dark:text-emerald-400">Us</span>
          </h1>
          <p className="mt-6 text-xl font-bold bg-lime-200 dark:bg-neutral-800 text-black dark:text-white inline-block px-6 py-2 rounded-xl border-2 border-black dark:border-white shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] transform rotate-1">
            Let's Talk!
          </p>
        </div>

        {/* Contact Info Card */}
        <div className="bg-white dark:bg-neutral-800 w-full max-w-2xl p-8 md:p-10 border-4 border-black dark:border-white rounded-3xl shadow-[8px_8px_0_0_#000] dark:shadow-[8px_8px_0_0_#fff] transform lg:-rotate-1 hover:rotate-0 transition-transform duration-300 space-y-8 text-center text-black dark:text-neutral-200">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wide border-b-4 border-yellow-400 dark:border-emerald-400 pb-4 inline-block">
            Get In Touch
          </h2>

          <p className="text-lg md:text-xl font-medium leading-relaxed">
            Have a question, feedback, or a cool collaboration idea? <br />
            Feel free to reach out through any of the channels below!
          </p>

          <div className="flex flex-col gap-6 w-full items-center mt-8">
            <a
              href="mailto:shivamraj1109.23@gmail.com"
              className="flex items-center justify-center gap-4 px-8 py-4 w-full md:w-4/5 font-black text-xl text-black dark:text-white border-4 border-black dark:border-white rounded-2xl bg-cyan-400 hover:bg-cyan-300 dark:bg-cyan-600 dark:hover:bg-cyan-500 hover:-translate-y-2 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none"
            >
              <FaEnvelope size={28} />
              Email Me
            </a>

            <a
              href="https://www.linkedin.com/in/shivamraj11"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-4 px-8 py-4 w-full md:w-4/5 font-black text-xl text-black dark:text-white border-4 border-black dark:border-white rounded-2xl bg-blue-500 hover:bg-blue-400 dark:bg-blue-700 dark:hover:bg-blue-600 hover:-translate-y-2 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none"
            >
              <FaLinkedin size={28} />
              LinkedIn connect
            </a>

            <div className="flex flex-col sm:flex-row gap-6 w-full md:w-4/5 justify-between">
              <a
                href="https://www.rajshivam.in"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 w-full font-bold text-lg text-black dark:text-white border-4 border-black dark:border-white rounded-2xl bg-sky-400 hover:bg-sky-300 dark:bg-sky-600 dark:hover:bg-sky-500 hover:-translate-y-2 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none"
              >
                <FaGlobe size={24} />
                Portfolio
              </a>
              <a
                href="https://github.com/shivam-821"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 px-6 py-4 w-full font-bold text-lg text-black dark:text-white border-4 border-black dark:border-white rounded-2xl bg-slate-300 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 hover:-translate-y-2 hover:shadow-[6px_6px_0_0_#000] dark:hover:shadow-[6px_6px_0_0_#fff] transition-all shadow-[4px_4px_0_0_#000] dark:shadow-[4px_4px_0_0_#fff] active:translate-y-1 active:shadow-none"
              >
                <FaGithub size={24} />
                GitHub
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
