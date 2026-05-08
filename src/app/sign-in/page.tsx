"use client";

import Link from "next/link";
import { useState } from "react";

export default function SignInPage() {
  const [mode, setMode] = useState<"signin" | "register">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="flex min-h-screen">

        {/* Left panel */}
        <div className="hidden bg-brown-900 lg:flex lg:w-1/2 lg:flex-col lg:justify-between lg:p-16">
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold tracking-wide text-cream-100">EURO GLOBAL</span>
            <span className="text-[10px] font-light tracking-[0.25em] text-brown-400 uppercase">Machinery</span>
          </Link>

          <div>
            <p className="section-label mb-4 text-brown-500">Trusted by Professionals</p>
            <blockquote className="font-serif text-2xl font-light leading-relaxed text-cream-100">
              &ldquo;Euro Global Machinery gave our dealership access to buyers across twelve countries we had never reached before.&rdquo;
            </blockquote>
            <p className="mt-6 text-sm text-brown-400">— Thomas Bauer, Schmidt Agrar GmbH, Germany</p>
          </div>

          <div className="grid grid-cols-3 gap-6 border-t border-brown-800 pt-8">
            {[
              { value: "52,000+", label: "Active Listings" },
              { value: "3,800+", label: "Verified Dealers" },
              { value: "28",     label: "Countries" },
            ].map((s) => (
              <div key={s.label}>
                <p className="font-serif text-2xl font-semibold text-cream-50">{s.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-brown-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex w-full flex-col justify-center px-6 py-16 lg:w-1/2 lg:px-20">

          {/* Mobile logo */}
          <div className="mb-10 lg:hidden">
            <Link href="/" className="flex flex-col leading-none">
              <span className="font-serif text-lg font-semibold tracking-wide text-brown-900">EURO GLOBAL</span>
              <span className="text-[10px] font-light tracking-[0.25em] text-brown-400 uppercase">Machinery</span>
            </Link>
          </div>

          <div className="mx-auto w-full max-w-sm">

            {/* Tab toggle */}
            <div className="mb-8 flex border border-brown-200">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  mode === "signin" ? "bg-brown-900 text-cream-50" : "bg-white text-brown-500 hover:text-brown-800"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("register")}
                className={`flex-1 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                  mode === "register" ? "bg-brown-900 text-cream-50" : "bg-white text-brown-500 hover:text-brown-800"
                }`}
              >
                Register
              </button>
            </div>

            <h1 className="mb-1 font-serif text-2xl font-semibold text-brown-900">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="mb-8 text-sm text-brown-500">
              {mode === "signin"
                ? "Sign in to manage your listings and enquiries."
                : "Join thousands of buyers and sellers across Europe."}
            </p>

            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                    Password
                  </label>
                  {mode === "signin" && (
                    <button type="button" className="text-xs text-brown-400 underline-offset-2 hover:text-brown-700 hover:underline">
                      Forgot password?
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  placeholder={mode === "register" ? "Min. 8 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {mode === "register" && (
                <div>
                  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-brown-600">
                    Account Type
                  </label>
                  <select className="input-field">
                    <option value="buyer">Buyer</option>
                    <option value="individual">Individual Seller</option>
                    <option value="dealer">Dealer</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary w-full text-xs uppercase tracking-widest"
              >
                {mode === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-brown-100" />
              <span className="text-xs uppercase tracking-widest text-brown-300">or</span>
              <div className="h-px flex-1 bg-brown-100" />
            </div>

            <button
              type="button"
              className="w-full border border-brown-200 bg-white py-3 text-xs font-semibold uppercase tracking-widest text-brown-700 transition-colors hover:bg-cream-100"
            >
              Continue with Google
            </button>

            <p className="mt-8 text-center text-xs text-brown-400">
              {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "signin" ? "register" : "signin")}
                className="font-semibold text-brown-700 underline-offset-2 hover:underline"
              >
                {mode === "signin" ? "Register" : "Sign In"}
              </button>
            </p>

            <p className="mt-4 text-center text-xs text-brown-300">
              By continuing you agree to our{" "}
              <Link href="/terms" className="underline-offset-2 hover:underline">Terms</Link>
              {" "}and{" "}
              <Link href="/privacy" className="underline-offset-2 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
