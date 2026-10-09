"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import BackgroundParallax from "@/components/BackgroundParallax";
import SectionAnimator from "@/components/SectionAnimator";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const [formState, setFormState] = useState<"idle" | "sending" | "success">("idle");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("sending");

    setTimeout(() => {
      setFormState("success");
      setFullName("");
      setCompany("");
      setEmail("");
      setMessage("");

      setTimeout(() => {
        setFormState("idle");
      }, 4000);
    }, 1500);
  };

  return (
    <div className="relative min-h-screen bg-base-100 text-base-content flex flex-col">
      <BackgroundParallax />
      <Navbar />

      <main className="relative z-10 flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-12 sm:pt-20 pb-10 sm:pb-16">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 animate-entrance">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-base-content mb-4 sm:mb-6 tracking-tight leading-tight">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-base sm:text-xl text-base-content/80 leading-relaxed font-normal">
                Whether you&apos;re an advertiser looking for premium billboard
                space or a media owner ready to digitize your inventory, our
                team is here to help.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Content Grid (Left Form, Right Info Cards) */}
        <SectionAnimator>
          <section className="pb-16 sm:pb-20 px-4 sm:px-6">
            <div className="max-w-[1200px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
              {/* Contact Form (Left Column) */}
              <div className="lg:col-span-7 bg-base-100 rounded-3xl p-5 sm:p-12 shadow-3d border border-base-200">
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className="input input-bordered w-full bg-base-200/50 text-base-content text-sm h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70">
                        Company
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company Name"
                        className="input input-bordered w-full bg-base-200/50 text-base-content text-sm h-12"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@company.com"
                      className="input input-bordered w-full bg-base-200/50 text-base-content text-sm h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-base-content/70">
                      Message
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell us about your project or inquiry..."
                      className="textarea textarea-bordered w-full bg-base-200/50 text-base-content text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formState !== "idle"}
                    className={`btn w-full sm:w-auto px-8 sm:px-10 py-3.5 rounded-xl font-bold text-base transition-all border-none ${
                      formState === "success"
                        ? "bg-emerald-600 text-white"
                        : "bg-[#4f46e5] hover:bg-[#3525cd] text-white shadow-md"
                    }`}
                  >
                    {formState === "sending" && (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Sending...</span>
                      </>
                    )}

                    {formState === "success" && (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
                        <span>Sent Successfully!</span>
                      </>
                    )}

                    {formState === "idle" && (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Contact Info (Right Column) */}
              <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                {/* Lagos Office */}
                <div className="p-5 sm:p-8 rounded-3xl bg-base-200/60 border border-base-300 flex gap-4 sm:gap-5 items-start hover:border-primary/40 transition-colors shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-base-content mb-1">
                      Lagos Office
                    </h3>
                    <p className="text-base-content/80 text-xs sm:text-sm">
                      Ikeja, Lagos, Nigeria.
                    </p>
                  </div>
                </div>

                {/* Abuja Office */}
                <div className="p-5 sm:p-8 rounded-3xl bg-base-200/60 border border-base-300 flex gap-4 sm:gap-5 items-start hover:border-primary/40 transition-colors shadow-sm">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-base-content mb-1">
                      Abuja Office
                    </h3>
                    <p className="text-base-content/80 text-xs sm:text-sm">
                      Central Business District, Abuja, Nigeria.
                    </p>
                  </div>
                </div>

                {/* Direct Support Card (Solid Primary Card) */}
                <div className="p-5 sm:p-8 rounded-3xl bg-[#3525cd] text-white shadow-xl space-y-5 sm:space-y-6">
                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Direct Support
                  </h3>
                  <div className="space-y-4">
                    <a
                      href="mailto:support@advers.ng"
                      className="flex items-center gap-3.5 sm:gap-4 group text-white/90 hover:text-white"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#3525cd] flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base group-hover:underline break-all">
                        support@advers.ng
                      </span>
                    </a>

                    <a
                      href="tel:+234800ADVERS"
                      className="flex items-center gap-3.5 sm:gap-4 group text-white/90 hover:text-white"
                    >
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white text-[#3525cd] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="font-semibold text-sm sm:text-base group-hover:underline">
                        +234 (0) 800 ADVERS
                      </span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </SectionAnimator>

        {/* Map Section */}
        <SectionAnimator>
          <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pb-16 sm:pb-24">
            <div className="w-full h-[260px] sm:h-[400px] rounded-3xl overflow-hidden shadow-3d border border-base-300 relative group">
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuA6fSg1SMwLa2yKOJET3lqGPw1PJcFOoAcXRf_chiwFgOWPqJRO4zZY7MM8NItBewViiGJ_4bO-j2kLvki6ejBzIJvUCtMK8oJPsNjBp_xJvtH23ulPznEiekZLhpdHh3j3-UVJJ-RI5xnR30PxUazeaFylb1Znji5J9SSIO1J9kZEk9guPe_GyX78HBNbr-cCTJs-O0UUYj7SXqKDO7G3FoFlNKG8dOeCDJnH4CZPLhgUoO6hpbLgcuCv8Fwz8cy_6C7FcK9ac2aU")`,
                }}
              />
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-base-100/90 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold text-base-content border border-base-200 shadow-md">
                Lagos &amp; Abuja Digital Operations Hubs
              </div>
            </div>
          </section>
        </SectionAnimator>
      </main>

      <Footer />
    </div>
  );
}
