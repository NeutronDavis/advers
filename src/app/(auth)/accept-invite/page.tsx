"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, CheckCircle2, Lock, Phone, User, ArrowRight, Loader2 } from "lucide-react";

function AcceptInviteForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "demo-token";

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/portal/welcome");
    }, 1200);
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          Payment Confirmed!
        </h1>
        <p className="text-xs text-base-content/70">
          Set up your password to activate your Advers portal account
        </p>
      </div>

      <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-primary shrink-0" />
        <div className="text-xs text-base-content">
          <span className="font-bold">Package:</span> Look Professional Tier
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
            Your Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
            />
            <User className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
            WhatsApp Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 800 000 0000"
              className="input input-bordered w-full pl-10 bg-base-200/50 text-sm h-11"
            />
            <Phone className="w-4 h-4 text-base-content/40 absolute left-3.5 top-3.5" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
            Choose Password
          </label>
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
              <span>Activating Account...</span>
            </>
          ) : (
            <>
              <span>Activate &amp; Onboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-xs text-base-content/60">Loading invite details...</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
