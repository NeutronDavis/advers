"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, ArrowRight, AlertCircle, Loader2, ShieldCheck, UserCheck, Sparkles } from "lucide-react";
import { LoginSchema } from "@/lib/validations/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (userEmail: string, role: "admin" | "active-client" | "new-client") => {
    setEmail(userEmail);
    setPassword("password123");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (role === "admin") {
        router.push("/admin/inbox");
      } else if (role === "active-client") {
        router.push("/portal/dashboard");
      } else {
        router.push("/portal/welcome");
      }
    }, 800);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = LoginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      if (email.includes("admin")) {
        router.push("/admin/inbox");
      } else if (email === "client@advers.ng") {
        router.push("/portal/dashboard");
      } else {
        router.push("/portal/welcome");
      }
    }, 1000);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
          <LogIn className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          Welcome back
        </h1>
        <p className="text-xs text-base-content/70">
          Enter your credentials or use 1-click test accounts
        </p>
      </div>

      {/* Quick Demo Test Buttons */}
      <div className="p-3 bg-base-200/60 rounded-2xl border border-base-200 space-y-2">
        <div className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider text-center flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick 1-Click Demo Accounts</span>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          <button
            type="button"
            onClick={() => handleDemoLogin("admin@advers.ng", "admin")}
            className="btn btn-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl border-none flex items-center justify-between px-3 py-2 h-auto"
          >
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin / Staff Backoffice</span>
            </span>
            <span className="text-[10px] opacity-80">admin@advers.ng</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("client@advers.ng", "active-client")}
            className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl border-none flex items-center justify-between px-3 py-2 h-auto"
          >
            <span className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Active Client Dashboard</span>
            </span>
            <span className="text-[10px] opacity-80">client@advers.ng</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("newclient@advers.ng", "new-client")}
            className="btn btn-xs btn-outline border-base-300 text-base-content font-bold rounded-xl flex items-center justify-between px-3 py-2 h-auto hover:bg-base-200"
          >
            <span className="flex items-center gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              <span>New Client Onboarding</span>
            </span>
            <span className="text-[10px] opacity-60">newclient@advers.ng</span>
          </button>
        </div>
      </div>

      <div className="divider text-[10px] text-base-content/40 my-1">OR ENTER CREDENTIALS</div>

      {error && (
        <div className="alert alert-error shadow-sm text-xs py-2.5 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@advers.ng or client@advers.ng"
              className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
            />
            <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Password
            </label>
            <a href="#" className="text-xs text-primary font-semibold hover:underline">
              Forgot?
            </a>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
            />
            <Lock className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white w-full rounded-xl font-bold py-3 text-base shadow-md border-none flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Logging in...</span>
            </>
          ) : (
            <>
              <span>Log In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-xs text-base-content/80 pt-1">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
