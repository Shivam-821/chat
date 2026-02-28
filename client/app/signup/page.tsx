"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { registerApi } from "@/api/api";
import { FaUserPlus, FaEnvelope, FaLock, FaUser } from "react-icons/fa";
import Link from "next/link";

const SignUpPage = () => {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const response = await registerApi(name, username, email, password);
    if (response) {
      // login automatically on successful registration
      login(response);
      router.push("/chat");
    } else {
      setError("Failed to sign up. Please try again.");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)] w-full items-center justify-center py-10 px-6 bg-[#f8fafc] dark:bg-neutral-950 relative overflow-hidden">
      {/* Playful Background Elements */}
      <div className="absolute top-[5%] left-[-10%] w-80 h-80 bg-emerald-300/20 dark:bg-emerald-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      <div className="absolute bottom-[20%] right-[-5%] w-72 h-72 bg-indigo-300/20 dark:bg-indigo-900/20 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>

      <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-3xl p-8 sm:p-10 border-[3px] border-slate-800 dark:border-neutral-700 shadow-[6px_6px_0_0_rgba(30,41,59,1)] dark:shadow-[6px_6px_0_0_rgba(23,23,23,1)] relative z-10 my-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight mb-2">
            Join the Fun!{" "}
            <span className="text-4xl inline-block rotate-15 transform origin-bottom mt-1"></span>
          </h1>
          <p className="text-slate-500 dark:text-neutral-400 font-bold">
            Create an account to start chatting
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-300 dark:border-rose-800 rounded-xl text-rose-600 dark:text-rose-400 font-bold text-center text-sm shadow-[2px_2px_0_0_rgba(225,29,72,0.2)]">
            {error}
          </div>
        )}

        <form onSubmit={handleSignUp} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <FaUser size={16} />
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Alex Developer"
                className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 focus:border-amber-400 dark:focus:border-amber-500 text-slate-800 dark:text-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none transition-colors font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <FaUser size={16} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="alexdev_"
                className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 focus:border-amber-400 dark:focus:border-amber-500 text-slate-800 dark:text-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none transition-colors font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <FaEnvelope size={16} />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="alex@example.com"
                className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 focus:border-amber-400 dark:focus:border-amber-500 text-slate-800 dark:text-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none transition-colors font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                <FaLock size={16} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-slate-50 dark:bg-neutral-900 border-2 border-slate-300 dark:border-neutral-600 focus:border-amber-400 dark:focus:border-amber-500 text-slate-800 dark:text-slate-200 rounded-xl pl-11 pr-4 py-3 focus:outline-none transition-colors font-medium shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full bg-slate-800 hover:bg-slate-700 dark:bg-emerald-400 dark:hover:bg-emerald-300 text-white dark:text-slate-900 font-black text-lg py-4 rounded-xl border-2 border-transparent dark:border-slate-800 shadow-[4px_4px_0_0_rgba(100,116,139,0.5)] dark:shadow-[4px_4px_0_0_rgba(30,41,59,1)] transition-all hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0_0_rgba(100,116,139,0.5)] dark:hover:shadow-[2px_2px_0_0_rgba(30,41,59,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px] flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="animate-pulse">Creating account...</span>
            ) : (
              <>
                Sign Up <FaUserPlus className="ml-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center border-t-2 border-dashed border-slate-200 dark:border-neutral-700 pt-6">
          <p className="text-slate-500 dark:text-neutral-400 font-medium">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold hover:underline underline-offset-4 pl-1"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
