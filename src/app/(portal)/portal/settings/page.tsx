"use client";

import React, { useState } from "react";
import { User, Lock, Building, Phone, Save, CheckCircle2 } from "lucide-react";

export default function ClientSettingsPage() {
  const [name, setName] = useState("Olumide Adebayo");
  const [email, setEmail] = useState("olumide@adebayoholdings.ng");
  const [phone, setPhone] = useState("+234 803 123 4567");
  const [company, setCompany] = useState("Adebayo Holdings");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-entrance">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-base-content tracking-tight">
          Account &amp; Organization Settings
        </h1>
        <p className="text-xs text-base-content/70">
          Manage your client profile, notification preferences &amp; credentials
        </p>
      </div>

      <div className="bg-base-100 rounded-3xl p-6 sm:p-8 border border-base-200 shadow-3d space-y-5">
        {saved && (
          <div className="alert alert-success text-xs py-3 rounded-2xl text-white">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                Contact Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input input-bordered w-full bg-base-200/50 text-sm h-11"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input input-bordered w-full bg-base-200/50 text-sm h-11"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="input input-bordered w-full bg-base-200/50 text-sm h-11 opacity-70"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-base-content/70 block mb-1">
                WhatsApp Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input input-bordered w-full bg-base-200/50 text-sm h-11"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-base-200">
            <button
              type="submit"
              className="btn bg-[#4f46e5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl gap-2 shadow-md border-none px-6"
            >
              <Save className="w-4 h-4" />
              <span>Save Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
