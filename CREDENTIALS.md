# 🔐 Advers App Test Login Credentials & Guide

This document contains test credentials and quick-access routes to test the **Advers** web application, staff backoffice, and client onboarding flow.

---

## 🔑 Test Accounts & Credentials

| Role | Email | Password | Landing Target | Description |
|---|---|---|---|---|
| 🛡️ **Admin / Staff** | `admin@advers.ng` | `password123` | `/admin/inbox` | Full staff access to lead qualification, enquiry inbox & sending client invites. |
| 👤 **Active Client** | `client@advers.ng` | `password123` | `/portal/dashboard` | Active client portal (Look Professional Tier, 75% production progress, domain active). |
| ✨ **New Client** | `newclient@advers.ng` | `password123` | `/portal/welcome` | New client onboarding flow (Step 1 Welcome Profile Setup -> Step 2 Package Wizard). |

---

## ⚡ 1-Click Quick Testing (Login Page)

Navigate to **`/login`** in your browser. At the top of the login form, you will find **1-Click Demo Buttons**:
1. Click **Admin / Staff Backoffice** to log in instantly as Admin.
2. Click **Active Client Dashboard** to test the active client portal view.
3. Click **New Client Onboarding** to test the step-by-step onboarding wizard.

---

## 🌐 Application Route Navigation Map

- **Home Landing Page**: `/`
- **Client Sign Up**: `/signup`
- **Client Login**: `/login`
- **Payment Invitation Acceptance**: `/accept-invite`
- **Client Onboarding Welcome**: `/portal/welcome`
- **Package Onboarding Wizard**: `/portal/onboarding/eng-101`
- **Client Portal Dashboard**: `/portal/dashboard`
- **Client Projects & Bookings**: `/portal/projects`
- **Client Settings**: `/portal/settings`
- **Staff Backoffice Inbox**: `/admin/inbox`
- **Digital Packages Spec**: `/visibility-journey`
- **About Us**: `/about`
- **Contact Us**: `/contact`

---

## 🗄️ MySQL Database Commands

- **Generate Prisma Client**:
  ```bash
  npx prisma generate
  ```
- **Sync Schema to Database**:
  ```bash
  npx prisma db push
  ```
- **Seed Demo Data**:
  ```bash
  npx tsx prisma/seed.ts
  ```
