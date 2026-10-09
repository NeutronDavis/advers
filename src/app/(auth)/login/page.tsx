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
        router.push("/admin");
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
        router.push("/admin");
      } else if (email === "client@advers.ng") {
        router.push("/portal/dashboard");
      } else {
        router.push("/portal/welcome");
      }
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-base-content/70 font-medium">
          Sign in to your account or use a 1-click test profile below.
        </p>
      </div>

      {/* Quick 1-Click Demo Accounts */}
      <div className="p-4 bg-base-200/50 rounded-2xl border border-base-200 space-y-2.5">
        <div className="text-[11px] font-bold text-base-content/70 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Quick Test Credentials</span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin("admin@advers.ng", "admin")}
            className="flex items-center justify-between p-3 rounded-xl bg-base-100 border border-base-200 hover:border-primary/50 transition-all text-xs font-bold text-base-content group"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Admin / Staff Backoffice</span>
            </span>
            <span className="text-[11px] text-base-content/50 font-normal">admin@advers.ng</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("client@advers.ng", "active-client")}
            className="flex items-center justify-between p-3 rounded-xl bg-base-100 border border-base-200 hover:border-primary/50 transition-all text-xs font-bold text-base-content group"
          >
            <span className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>Active Client Dashboard</span>
            </span>
            <span className="text-[11px] text-base-content/50 font-normal">client@advers.ng</span>
          </button>

          <button
            type="button"
            onClick={() => handleDemoLogin("newclient@advers.ng", "new-client")}
            className="flex items-center justify-between p-3 rounded-xl bg-base-100 border border-base-200 hover:border-primary/50 transition-all text-xs font-bold text-base-content group"
          >
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-primary" />
              <span>New Client Onboarding Flow</span>
            </span>
            <span className="text-[11px] text-base-content/50 font-normal">newclient@advers.ng</span>
          </button>
        </div>
      </div>

      <div className="relative flex items-center justify-center my-2">
        <div className="border-t border-base-200 w-full" />
        <span className="bg-base-100 px-3 text-[10px] uppercase font-bold text-base-content/40 absolute">
          or sign in with email
        </span>
      </div>

      {error && (
        <div className="alert alert-error text-xs py-3 rounded-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@advers.ng or client@advers.ng"
              className="input input-bordered w-full pl-10 bg-base-200/40 text-sm h-12 rounded-xl focus:border-primary"
            />
            <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-4" />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-base-content/70">
              Password
            </label>
            <a href="#" className="text-xs text-primary font-semibold hover:underline">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input input-bordered w-full pl-10 bg-base-200/40 text-sm h-12 rounded-xl focus:border-primary"
            />
            <Lock className="w-4 h-4 text-base-content/40 absolute left-3.5 top-4" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white w-full rounded-xl font-bold py-3.5 text-base shadow-md border-none flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-base-content/70 font-medium">
        Don&apos;t have an account yet?{" "}
        <Link href="/signup" className="text-primary font-bold hover:underline">
          Create account
        </Link>
      </div>
    </div>
  );
}
