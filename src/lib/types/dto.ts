// Data Transfer Objects (DTOs) for Advers Web App

export type UserRole = "CLIENT" | "STAFF" | "ADMIN";
export type OrgRole = "OWNER" | "MEMBER";
export type UserStatus = "UNVERIFIED" | "PROSPECT" | "ACTIVE" | "DEACTIVATED";

export interface UserDTO {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: UserRole;
  orgRole: OrgRole;
  status: UserStatus;
  source?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  company?: string | null;
  packageName?: string | null;
  emailVerifiedAt?: string | null;
  profileCompleteAt?: string | null;
  lastLoginAt?: string | null;
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
  source?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
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
  source?: string | null;
  createdAt: string;
}

export interface InvoiceDTO {
  id: string;
  invoiceNumber: string;
  clientId: string;
  clientName?: string;
  title: string;
  amount: number;
  serviceType: string;
  status: "DRAFT" | "PENDING" | "PAID" | "OVERDUE" | "CANCELLED";
  dueDate: string;
  paidAt?: string | null;
  createdAt: string;
}

export interface PaymentDTO {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  reference: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  createdAt: string;
}

export interface QuoteDTO {
  id: string;
  quoteNumber: string;
  title: string;
  amount: number;
  status: "DRAFT" | "SENT" | "VIEWED" | "ACCEPTED" | "REJECTED" | "EXPIRED";
  sentAt: string;
  openedAt?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface RenewalDTO {
  id: string;
  clientId: string;
  clientName?: string;
  title: string;
  amount: number;
  renewalDate: string;
  status: "UPCOMING" | "RENEWED" | "CANCELLED";
  createdAt: string;
}

export interface ActivityLogDTO {
  id: string;
  userId?: string | null;
  userName?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  action: string;
  description: string;
  metadata?: string | null;
  createdAt: string;
}

export interface AuditLogDTO {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: string | null;
  createdAt: string;
}

export interface AdminKPICardsData {
  totalSignups: { value: number; changeThisWeek: number };
  unverifiedSignups: number;
  newLeads30d: number;
  unreadInbox: { total: number; hasOverdue24h: boolean };
  quotesAwaitingResponse: number;
  activeProjects: { total: number; waitingOnClientCount: number };
  revenueThisMonth: { amount: number; changeVsLastMonthPercent: number };
  outstandingInvoices: { amount: number; overdueCount: number };
  renewalsDue30d: number;
  billboardOccupancyPercent: string;
}

export interface AdminDashboardChartsData {
  signupsPerDay: { date: string; signups: number }[];
  revenuePerMonth: { month: string; digital: number; ecosystem: number; billboard: number }[];
  conversionFunnel: { step: string; count: number; conversionRate: number }[];
}

export interface NeedsAttentionItem {
  id: string;
  category: "INBOX" | "PROJECT" | "INVOICE" | "QUOTE" | "ONBOARDING";
  title: string;
  subtitle: string;
  link: string;
  severity: "high" | "medium";
  timeText: string;
}
