"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Sparkles,
  Globe,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Save,
  Check,
  Building,
} from "lucide-react";

export default function OnboardingWizardPage() {
  const router = useRouter();
  const params = useParams();
  const engagementId = params.engagementId || "eng-101";

  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Form State
  const [businessName, setBusinessName] = useState("Adebayo Holdings");
  const [domainOption1, setDomainOption1] = useState("adebayoholdings.ng");
  const [domainOption2, setDomainOption2] = useState("adebayo.com.ng");
  const [domainOption3, setDomainOption3] = useState("adebayogroup.ng");
  const [preferredEmailPrefix, setPreferredEmailPrefix] = useState("hello");
  const [tagline, setTagline] = useState("Empowering Nigerian Businesses");

  const [brandColors, setBrandColors] = useState("Deep Indigo & Warm Gold");
  const [brandTone, setBrandTone] = useState("Professional, Modern & Authoritative");
  const [googleBusinessName, setGoogleBusinessName] = useState("Adebayo Holdings Victoria Island");
  const [socialHandles, setSocialHandles] = useState("@adebayoholdings");

  const handleNext = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Complete wizard & move to dashboard
        router.push("/portal/dashboard");
      }
    }, 600);
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-2 sm:pt-6 animate-entrance">
      {/* Step Indicator Bar using daisyUI steps */}
      <div className="bg-base-100/90 backdrop-blur-xl border border-base-200 rounded-3xl p-4 sm:p-6 shadow-3d text-center">
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Package: Look Professional Tier
          </span>
          <span className="text-xs font-bold text-base-content/60">
            Step {currentStep} of 3
          </span>
        </div>

        {/* DaisyUI Steps */}
        <ul className="steps steps-horizontal w-full text-xs font-bold">
          <li className={`step ${currentStep >= 1 ? "step-primary" : ""}`}>
            Identity &amp; Domain
          </li>
          <li className={`step ${currentStep >= 2 ? "step-primary" : ""}`}>
            Brand Preferences
          </li>
          <li className={`step ${currentStep >= 3 ? "step-primary" : ""}`}>
            Review &amp; Launch
          </li>
        </ul>
      </div>

      {/* Step Content Card */}
      <div className="bg-base-100/90 backdrop-blur-xl border border-base-200 rounded-3xl p-6 sm:p-8 shadow-3d space-y-6">
        {currentStep === 1 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-base-content">
                  Business Identity &amp; Domain Selection
                </h2>
                <p className="text-xs text-base-content/70">
                  Select your preferred domain names for 1 year included hosting.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                  Official Business Name
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block">
                  Top 3 Preferred Domain Options (.ng / .com.ng)
                </label>
                <input
                  type="text"
                  value={domainOption1}
                  onChange={(e) => setDomainOption1(e.target.value)}
                  placeholder="Option 1: adebayoholdings.ng"
                  className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                />
                <input
                  type="text"
                  value={domainOption2}
                  onChange={(e) => setDomainOption2(e.target.value)}
                  placeholder="Option 2: adebayo.com.ng"
                  className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                />
                <input
                  type="text"
                  value={domainOption3}
                  onChange={(e) => setDomainOption3(e.target.value)}
                  placeholder="Option 3: adebayogroup.ng"
                  className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                    Preferred Business Email
                  </label>
                  <div className="flex items-center gap-1">
                    <input
                      type="text"
                      value={preferredEmailPrefix}
                      onChange={(e) => setPreferredEmailPrefix(e.target.value)}
                      className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                    />
                    <span className="text-xs text-base-content/60 font-semibold shrink-0">
                      @yourdomain.ng
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                    Tagline / Slogan
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-base-content">
                  Brand Aesthetics &amp; Google Details
                </h2>
                <p className="text-xs text-base-content/70">
                  Help us align the design language with your target market.
                </p>
              </div>
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                  Brand Color Palette &amp; Style Guidelines
                </label>
                <input
                  type="text"
                  value={brandColors}
                  onChange={(e) => setBrandColors(e.target.value)}
                  placeholder="e.g. Navy Blue, Emerald Green, Minimalist Gold"
                  className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                  Brand Tone &amp; Messaging Voice
                </label>
                <input
                  type="text"
                  value={brandTone}
                  onChange={(e) => setBrandTone(e.target.value)}
                  placeholder="e.g. Luxurious, Accessible, High-tech, Trustworthy"
                  className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                    Google Business Profile Name
                  </label>
                  <input
                    type="text"
                    value={googleBusinessName}
                    onChange={(e) => setGoogleBusinessName(e.target.value)}
                    className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                    Social Media Handles
                  </label>
                  <input
                    type="text"
                    value={socialHandles}
                    onChange={(e) => setSocialHandles(e.target.value)}
                    className="input input-bordered w-full bg-base-200/50 text-sm h-11"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-base-content">
                  Review &amp; Confirm Submission
                </h2>
                <p className="text-xs text-base-content/70">
                  Verify your choices before submitting to your assigned production team.
                </p>
              </div>
            </div>

            <div className="space-y-3 p-4 bg-base-200/50 rounded-2xl border border-base-200 text-xs">
              <div className="flex justify-between border-b border-base-300 pb-2">
                <span className="font-bold text-base-content/70">Business Name:</span>
                <span className="font-bold text-base-content">{businessName}</span>
              </div>
              <div className="flex justify-between border-b border-base-300 pb-2">
                <span className="font-bold text-base-content/70">Primary Domain:</span>
                <span className="font-bold text-primary">{domainOption1}</span>
              </div>
              <div className="flex justify-between border-b border-base-300 pb-2">
                <span className="font-bold text-base-content/70">Business Email:</span>
                <span className="font-bold text-base-content">
                  {preferredEmailPrefix}@{domainOption1}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold text-base-content/70">Brand Colors:</span>
                <span className="font-bold text-base-content">{brandColors}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              ✨ Once submitted, your dedicated Advers manager will review and begin the 3-5 page custom design within 24 hours.
            </div>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className="btn btn-outline border-base-300 text-xs font-bold rounded-xl gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            disabled={saving}
            className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl gap-1.5 shadow-md border-none px-6"
          >
            {saving ? (
              <span>Saving...</span>
            ) : currentStep === 3 ? (
              <>
                <span>Complete Onboarding</span>
                <Check className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Save &amp; Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
