// Data Transfer Objects (DTOs) for Advers Web App

export type UserRole = "CLIENT" | "STAFF" | "ADMIN";
export type OrgRole = "OWNER" | "MEMBER";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  orgRole: OrgRole;
  emailVerifiedAt?: string | null;
  profileCompleteAt?: string | null;
  clientId?: string | null;
  createdAt: string;
}

export interface ClientDTO {
  id: string;
  name: string;
  industry?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  orgRole: OrgRole;
  clientId?: string | null;
  profileComplete: boolean;
}

export interface PackageDTO {
  id: string;
  key: string;
  name: string;
  tagline?: string | null;
  priceMin: number;
  priceMax: number;
  inclusions: string[];
}

export interface EngagementDTO {
  id: string;
  clientId: string;
  type: string;
  packageId?: string | null;
  status: string;
  onboardingProgress: number;
  waitingOnClient: boolean;
  createdAt: string;
}

export interface LeadDTO {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  packageInterest?: string | null;
  budgetRange?: string | null;
  timeline?: string | null;
  status: string;
  createdAt: string;
}

export interface FeedbackDTO {
  id: string;
  type: string;
  status: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  rating?: number | null;
  packageInterest?: string | null;
  createdAt: string;
}

export interface OnboardingStepResponseDTO {
  stepKey: string;
  data: Record<string, any>;
  completedAt: string;
}
