"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Campaign {
  id: string;
  name: string;
  channel: string;
  location: string;
  budget: number;
  duration: string;
  goal: string;
  status: "ACTIVE" | "IN_REVIEW" | "DRAFT" | "COMPLETED";
  createdAt: string;
  icon: string;
}

interface CampaignContextType {
  campaigns: Campaign[];
  addCampaign: (campaign: Omit<Campaign, "id" | "createdAt" | "status" | "icon">) => void;
  isModalOpen: boolean;
  selectedChannel: string;
  openCreateModal: (channel?: string) => void;
  closeCreateModal: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const defaultCampaigns: Campaign[] = [
  {
    id: "camp-001",
    name: "Summer Product Launch",
    channel: "Digital billboards",
    location: "Port Harcourt (GRA Junction)",
    budget: 150000,
    duration: "2 weeks",
    goal: "Brand awareness",
    status: "ACTIVE",
    createdAt: "2026-10-24",
    icon: "▣",
  },
  {
    id: "camp-002",
    name: "Brand Awareness Drive",
    channel: "FM radio",
    location: "Rivers State (Cool FM & Nigeria Info)",
    budget: 75000,
    duration: "1 week",
    goal: "Drive sales or enquiries",
    status: "IN_REVIEW",
    createdAt: "2026-10-26",
    icon: "♫",
  },
  {
    id: "camp-003",
    name: "Weekend Special Hype",
    channel: "Podcast advertising",
    location: "Nationwide / Online",
    budget: 35000,
    duration: "1-3 days",
    goal: "Promote an event",
    status: "DRAFT",
    createdAt: "2026-10-27",
    icon: "🎙",
  },
  {
    id: "camp-004",
    name: "Lekki Toll Mega Display",
    channel: "Digital billboards",
    location: "Lagos (Lekki Toll Gate Phase 1)",
    budget: 320000,
    duration: "1 month",
    goal: "Brand awareness",
    status: "ACTIVE",
    createdAt: "2026-10-15",
    icon: "▣",
  },
];

const channelIcons: Record<string, string> = {
  "Digital billboards": "▣",
  "Static billboards": "▧",
  "FM radio": "♫",
  Television: "▣",
  Newspapers: "▤",
  "Podcast advertising": "🎙",
  AdBoosters: "✦",
  "Influencer marketplace": "◎",
};

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({ children }: { children: React.ReactNode }) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(defaultCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const openCreateModal = (channel?: string) => {
    setSelectedChannel(channel || "");
    setIsModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsModalOpen(false);
    setSelectedChannel("");
  };

  const addCampaign = (
    data: Omit<Campaign, "id" | "createdAt" | "status" | "icon">
  ) => {
    const newCamp: Campaign = {
      ...data,
      id: `camp-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString().split("T")[0],
      status: "IN_REVIEW",
      icon: channelIcons[data.channel] || "▣",
    };

    setCampaigns((prev) => [newCamp, ...prev]);
    closeCreateModal();
    showToast(`Campaign "${newCamp.name}" submitted for media review!`);
  };

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        addCampaign,
        isModalOpen,
        selectedChannel,
        openCreateModal,
        closeCreateModal,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
}

export function useCampaign() {
  const context = useContext(CampaignContext);
  if (!context) {
    throw new Error("useCampaign must be used within a CampaignProvider");
  }
  return context;
}

