import { z } from "zod";

export const ProfileWelcomeSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  whatsappNumber: z.string().min(10, "Valid WhatsApp number is required"),
  companyName: z.string().min(2, "Company or Brand name is required"),
  industry: z.string().min(2, "Please specify your industry"),
  notificationPref: z.enum(["email", "whatsapp", "both"]).default("both"),
  timezone: z.string().default("Africa/Lagos"),
});

export type ProfileWelcomeInput = z.infer<typeof ProfileWelcomeSchema>;

export const OnboardingStep1Schema = z.object({
  businessName: z.string().min(2, "Business name is required"),
  domainOption1: z.string().min(3, "Primary domain choice is required"),
  domainOption2: z.string().optional(),
  domainOption3: z.string().optional(),
  preferredEmailPrefix: z.string().min(2, "Preferred email prefix (e.g. hello, info) is required"),
  taglineOrBio: z.string().min(10, "Please provide a brief bio or description"),
});

export type OnboardingStep1Input = z.infer<typeof OnboardingStep1Schema>;

export const OnboardingStep2Schema = z.object({
  brandColors: z.string().optional(),
  brandTone: z.string().optional(),
  googleBusinessName: z.string().optional(),
  socialLinks: z.string().optional(),
  referenceSites: z.string().optional(),
});

export type OnboardingStep2Input = z.infer<typeof OnboardingStep2Schema>;
