export const PLAN_KEYS = ["STARTER", "GROWTH", "BUSINESS_PRO"] as const;
export type PlanKey = (typeof PLAN_KEYS)[number];

export const PLAN_FEATURES = {
  CHANNEL_DISCOVERY: "Browse all advertising channels",
  CAMPAIGN_DRAFTS: "Create and save campaign drafts",
  CAMPAIGN_SUBMISSION: "Submit campaigns for review and booking",
  BASIC_REPORTING: "Basic campaign tracking and reporting",
  SME_HUB: "Advers SME Hub access",
  STANDARD_SUPPORT: "Standard customer support",
  CAMPAIGN_COMPARISON: "Campaign comparison tools",
  ADVANCED_REPORTING: "Advanced performance reports where data is available",
  PRIORITY_ACCESS: "Priority access to available opportunities",
  BULK_SMS: "Bulk SMS campaign management (delivery charged separately)",
  SAVED_PARTNERS: "Saved media partners and preferred placements",
  MARKETING_INSIGHTS: "Marketing recommendations and campaign insights",
  SERVICE_DISCOUNTS: "Discounts on selected Advers service fees",
  PRIORITY_SUPPORT: "Priority customer support",
  MULTI_LOCATION: "Multi-location campaign management",
  CONSOLIDATED_REPORTING: "Consolidated reporting across profiles and branches",
  PREMIUM_PLACEMENTS: "Premium placement discovery and booking assistance",
  TEAM_ACCESS: "Team access for up to three additional members",
  CUSTOM_REPORTS: "Custom campaign reports",
  DEDICATED_SUPPORT: "Dedicated priority support",
  EXCLUSIVE_OPPORTUNITIES: "Access to exclusive promotional opportunities when available",
  BEST_DISCOUNTS: "Best available discounts on selected Advers service fees",
} as const;

export type PlanFeature = keyof typeof PLAN_FEATURES;

const STARTER_FEATURES: PlanFeature[] = [
  "CHANNEL_DISCOVERY",
  "CAMPAIGN_DRAFTS",
  "CAMPAIGN_SUBMISSION",
  "BASIC_REPORTING",
  "SME_HUB",
  "STANDARD_SUPPORT",
];

const GROWTH_FEATURES: PlanFeature[] = [
  ...STARTER_FEATURES,
  "CAMPAIGN_COMPARISON",
  "ADVANCED_REPORTING",
  "PRIORITY_ACCESS",
  "BULK_SMS",
  "SAVED_PARTNERS",
  "MARKETING_INSIGHTS",
  "SERVICE_DISCOUNTS",
  "PRIORITY_SUPPORT",
];

const BUSINESS_PRO_FEATURES: PlanFeature[] = [
  ...GROWTH_FEATURES,
  "MULTI_LOCATION",
  "CONSOLIDATED_REPORTING",
  "PREMIUM_PLACEMENTS",
  "TEAM_ACCESS",
  "CUSTOM_REPORTS",
  "DEDICATED_SUPPORT",
  "EXCLUSIVE_OPPORTUNITIES",
  "BEST_DISCOUNTS",
];

export interface PlanDefinition {
  key: PlanKey;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  profileLimit: number;
  workspaceLimit: number;
  teamSeatLimit: number;
  features: PlanFeature[];
}

export const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    key: "STARTER",
    name: "Starter Access",
    tagline: "Your entry into professional marketing.",
    monthlyPrice: 1999,
    annualPrice: 19990,
    profileLimit: 1,
    workspaceLimit: 1,
    teamSeatLimit: 0,
    features: STARTER_FEATURES,
  },
  {
    key: "GROWTH",
    name: "Growth Access",
    tagline: "More campaigns, more control, more insight.",
    monthlyPrice: 4999,
    annualPrice: 49990,
    profileLimit: 3,
    workspaceLimit: 5,
    teamSeatLimit: 0,
    features: GROWTH_FEATURES,
  },
  {
    key: "BUSINESS_PRO",
    name: "Business Pro Access",
    tagline: "Built for established businesses and multi-location teams.",
    monthlyPrice: 9999,
    annualPrice: 99990,
    profileLimit: 10,
    workspaceLimit: 15,
    teamSeatLimit: 3,
    features: BUSINESS_PRO_FEATURES,
  },
];

export function getPlanDefinition(key: string): PlanDefinition | undefined {
  return PLAN_DEFINITIONS.find((plan) => plan.key === key);
}
