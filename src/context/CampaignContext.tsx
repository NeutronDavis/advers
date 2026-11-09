"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  createCampaignAction,
  saveCampaignDraftAction,
} from "@/server/actions/campaigns";
import type { Campaign } from "@/lib/types/campaign";

export type { Campaign } from "@/lib/types/campaign";

export interface BusinessProfileOption {
  id: string;
  name: string;
  isPrimary: boolean;
}

export interface CampaignCreateInput {
  name: string;
  channel: string;
  location: string;
  budget: number;
  duration: string;
  goal: string;
  businessProfileId?: string;
  inventoryId?: string;
  productService?: string;
  targetAudience?: string;
  startDate?: string;
  endDate?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  creativeAssetUrl?: string;
  creativeAssetType?: string;
  notes?: string;
}

interface CampaignContextType {
  campaigns: Campaign[];
  businessProfiles: BusinessProfileOption[];
  addCampaign: (campaign: CampaignCreateInput) => Promise<Campaign | null>;
  saveDraft: (campaign: CampaignCreateInput) => Promise<Campaign | null>;
  isModalOpen: boolean;
  selectedChannel: string;
  selectedInventoryId: string | null;
  openCreateModal: (channel?: string, inventoryId?: string) => void;
  closeCreateModal: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

export function CampaignProvider({
  children,
  initialCampaigns = [],
  businessProfiles = [],
}: {
  children: React.ReactNode;
  initialCampaigns?: Campaign[];
  businessProfiles?: BusinessProfileOption[];
}) {
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [selectedInventoryId, setSelectedInventoryId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setCampaigns(initialCampaigns);
  }, [initialCampaigns]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    window.setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  }, []);

  const openCreateModal = useCallback((channel?: string, inventoryId?: string) => {
    setSelectedChannel(channel || "");
    setSelectedInventoryId(inventoryId || null);
    setIsModalOpen(true);
  }, []);

  const closeCreateModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedChannel("");
    setSelectedInventoryId(null);
  }, []);

  const addCampaign = useCallback(
    async (data: CampaignCreateInput): Promise<Campaign | null> => {
      const result = await createCampaignAction(data);

      if (!result.success) {
        showToast(result.error);
        return null;
      }

      setCampaigns((prev) => [result.data, ...prev]);
      closeCreateModal();
      showToast(`Campaign "${result.data.name}" submitted for media review!`);
      return result.data;
    },
    [closeCreateModal, showToast]
  );

  const saveDraft = useCallback(
    async (data: CampaignCreateInput): Promise<Campaign | null> => {
      const result = await saveCampaignDraftAction(data);

      if (!result.success) {
        showToast(result.error);
        return null;
      }

      setCampaigns((prev) => [result.data, ...prev]);
      closeCreateModal();
      showToast(`Draft "${result.data.name}" saved. Submit it when you're ready.`);
      return result.data;
    },
    [closeCreateModal, showToast]
  );

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        businessProfiles,
        addCampaign,
        saveDraft,
        isModalOpen,
        selectedChannel,
        selectedInventoryId,
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
