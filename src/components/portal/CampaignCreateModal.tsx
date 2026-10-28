"use client";

import React, { useState, useEffect } from "react";
import { useCampaign } from "@/context/CampaignContext";
import { X, Sparkles, AlertCircle, ArrowRight } from "lucide-react";

export default function CampaignCreateModal() {
  const { isModalOpen, selectedChannel, closeCreateModal, addCampaign } = useCampaign();

  const [name, setName] = useState("");
  const [channel, setChannel] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState<number | "">("");
  const [duration, setDuration] = useState("1 week");
  const [goal, setGoal] = useState("Brand awareness");

  useEffect(() => {
    if (selectedChannel) {
      setChannel(selectedChannel);
    }
  }, [selectedChannel]);

  if (!isModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !channel || !location || !budget) return;

    addCampaign({
      name,
      channel,
      location,
      budget: Number(budget),
      duration,
      goal,
    });

    setName("");
    setChannel("");
    setLocation("");
    setBudget("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Click outside backdrop */}
      <div className="absolute inset-0" onClick={closeCreateModal} />

      <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto bg-base-100 text-base-content rounded-t-3xl sm:rounded-3xl shadow-2xl border border-base-200 z-10 p-5 sm:p-7 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-base-200">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase text-warning">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Launch Campaign</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-base-content mt-0.5">
              Create advertising campaign
            </h2>
          </div>
          <button
            type="button"
            onClick={closeCreateModal}
            className="btn btn-sm btn-circle btn-ghost text-base-content/70 hover:bg-base-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-base-content/70">
          Fill in your campaign objectives. Once submitted, our media team and partner stations confirm schedule availability and rate clearance.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content" htmlFor="campName">
              Campaign Name *
            </label>
            <input
              id="campName"
              type="text"
              required
              placeholder="e.g. Q4 Festive Mega Promo / Lekki Toll Display"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full text-sm rounded-xl focus:outline-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content" htmlFor="campChannel">
                Advertising Channel *
              </label>
              <select
                id="campChannel"
                required
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="select select-bordered w-full text-sm rounded-xl focus:outline-primary"
              >
                <option value="">Choose a channel</option>
                <option value="Digital billboards">Digital billboards (DOOH)</option>
                <option value="Static billboards">Static billboards (OOH)</option>
                <option value="FM radio">FM radio advertising</option>
                <option value="Television">Television advertising</option>
                <option value="Newspapers">Newspapers & Press</option>
                <option value="Podcast advertising">Podcast advertising</option>
                <option value="AdBoosters">AdBoosters network</option>
                <option value="Influencer marketplace">Influencer marketplace</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content" htmlFor="campLocation">
                Target Location *
              </label>
              <select
                id="campLocation"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="select select-bordered w-full text-sm rounded-xl focus:outline-primary"
              >
                <option value="">Select location</option>
                <option value="Lagos (Lekki / Victoria Island / Ikeja)">Lagos (Lekki / VI / Ikeja)</option>
                <option value="Port Harcourt (GRA / Aba Road)">Port Harcourt (GRA / Aba Rd)</option>
                <option value="Abuja (Central Business District)">Abuja (CBD / Maitama)</option>
                <option value="Enugu / East Arterials">Enugu / East Arterials</option>
                <option value="Kano / Northern Hub">Kano / Northern Hub</option>
                <option value="Nationwide / Online Digital">Nationwide / Online Digital</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content" htmlFor="campBudget">
                Estimated Budget (₦) *
              </label>
              <input
                id="campBudget"
                type="number"
                min="10000"
                step="5000"
                required
                placeholder="e.g. 150000"
                value={budget}
                onChange={(e) => setBudget(e.target.value === "" ? "" : Number(e.target.value))}
                className="input input-bordered w-full text-sm rounded-xl focus:outline-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-base-content" htmlFor="campDuration">
                Campaign Duration
              </label>
              <select
                id="campDuration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="select select-bordered w-full text-sm rounded-xl focus:outline-primary"
              >
                <option value="1-3 days">1–3 days (Hype flight)</option>
                <option value="1 week">1 week</option>
                <option value="2 weeks">2 weeks</option>
                <option value="1 month">1 month</option>
                <option value="Custom dates">Custom duration</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-base-content" htmlFor="campGoal">
              Primary Objective
            </label>
            <select
              id="campGoal"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="select select-bordered w-full text-sm rounded-xl focus:outline-primary"
            >
              <option value="Brand awareness">Brand awareness & visibility</option>
              <option value="Promote a product or service">Promote product or service</option>
              <option value="Drive sales or enquiries">Drive foot-traffic & phone enquiries</option>
              <option value="Promote an event">Promote an event / concert / webinar</option>
              <option value="Public announcement">Public announcement & press release</option>
            </select>
          </div>

          {/* Info notice box */}
          <div className="p-3 bg-base-200/60 rounded-xl flex items-start gap-2.5 text-xs text-base-content/70">
            <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <span>
              Advers will review your creative materials and secure partner rate confirmation. No charge is finalized until confirmation is issued.
            </span>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-base-200">
            <button
              type="button"
              onClick={closeCreateModal}
              className="btn btn-ghost btn-sm text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-sm text-xs font-black bg-[#101113] hover:bg-neutral text-white rounded-xl px-5 shadow-md flex items-center gap-1.5"
            >
              <span>Submit for review</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

