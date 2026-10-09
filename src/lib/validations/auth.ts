import { z } from "zod";

export const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Privacy Policy",
  }),
});

export type SignupInput = z.infer<typeof SignupSchema>;

export const AcceptInviteSchema = z.object({
  token: z.string().min(1, "Invite token is required"),
  name: z.string().min(2, "Full name is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(10, "Phone number is required"),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the Terms and Privacy Policy",
  }),
});

export type AcceptInviteInput = z.infer<typeof AcceptInviteSchema>;
