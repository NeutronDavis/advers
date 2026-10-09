"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { SignupSchema } from "@/lib/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = SignupSchema.safeParse({
      name,
      email,
      phone,
      password,
      terms,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      router.push("/portal/welcome");
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-base-content tracking-tight">
          Create Client Account
        </h1>
        <p className="text-sm text-base-content/70 font-medium">
          Get started with your digital presence &amp; billboard ad campaigns.
        </p>
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
            Full Name
          </label>
          <div className="relative">
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Olumide Adebayo"
              className="input input-bordered w-full pl-10 bg-base-200/40 text-sm h-12 rounded-xl focus:border-primary"
            />
            <User className="w-4 h-4 text-base-content/40 absolute left-3.5 top-4" />
          </div>
        </div>

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
              placeholder="olumide@company.ng"
              className="input input-bordered w-full pl-10 bg-base-200/40 text-sm h-12 rounded-xl focus:border-primary"
            />
            <Mail className="w-4 h-4 text-base-content/40 absolute left-3.5 top-4" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1.5">
            WhatsApp Phone Number
          </label>
          <div className="relative">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+234 801 234 5678"
              className="input input-bordered w-full pl-10 bg-base-200/40 text-sm h-12 rounded-xl focus:border-primary"
            />
            <Phone className="w-4 h-4 text-base-content/40 absolute left-3.5 top-4" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1.5">
            Choose Password
          </label>
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

        <div className="flex items-start gap-2.5 pt-1">
          <input
            type="checkbox"
            id="terms"
            checked={terms}
            onChange={(e) => setTerms(e.target.checked)}
            className="checkbox checkbox-primary checkbox-sm mt-0.5"
          />
          <label htmlFor="terms" className="text-xs text-base-content/80 cursor-pointer font-medium leading-relaxed">
            I agree to the <span className="font-bold text-primary">Terms of Service</span> and{" "}
            <span className="font-bold text-primary">Privacy Policy</span>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white w-full rounded-xl font-bold py-3.5 text-base shadow-md border-none flex items-center justify-center gap-2 mt-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center text-sm text-base-content/70 font-medium">
        Already have an account?{" "}
        <Link href="/login" className="text-primary font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
