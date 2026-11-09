**ADVERS**

**PRODUCT & ENGINEERING BUILD SPECIFICATION**

Marketing Access Plans + Advers Booster Marketplace

**ONE CLICK. UNLIMITED VISIBILITY.**

Prepared for the Advers Technology & Product Team  
Version 1.0  |  6 November 2026


# Document purpose and how to use it

This document combines the Advers Marketing Access Plans and the Advers Boosters strategy into one implementation brief. It explains what the platform must do, how the major user journeys connect, what data and controls are required, and what the team should deliver.

The source documents define the commercial plans and Booster ecosystem. Where this specification adds technical structure—such as suggested records, statuses, permissions, acceptance criteria or workflow sequencing—it is labelled as an implementation recommendation. These recommendations should be reviewed by Product before development is treated as final.

# 1. Product overview

Advers is a marketing platform designed to make advertising opportunities easier to discover, access, organise and manage. Businesses can explore advertising channels, prepare campaigns, request or book placements, and coordinate the people and services needed to execute campaigns.

The platform has two connected commercial layers:

- Marketing Access Plans: paid software subscriptions that determine the account’s tools, capacity, reporting and support.

- Advers Boosters: a workforce and service-provider marketplace through which individuals, professionals and businesses can earn by completing marketing-related jobs and campaign tasks.

The central product principle is that subscription access and campaign expenditure are separate. A subscription pays for software access; actual media placements, production, logistics, SMS delivery and other services are paid for separately.

# 2. Core platform areas

| **Platform area** | **Purpose** | **Primary users** |
| - | - | - |
| **Account & business profiles** | **Create user accounts and one or more business profiles/branches according to subscription limits.** | **Advertisers, business owners, team members** |
| **Marketing opportunity discovery** | **Explore billboard, FM radio, TV, newspaper and podcast opportunities, including rates and placement information where available.** | **Advertisers** |
| **Campaign workspace** | **Create, save, submit, compare, schedule and track campaigns.** | **Advertisers, campaign teams, Advers operations** |
| **Subscription & billing** | **Manage Starter, Growth and Business Pro access; renewals; invoices; plan entitlements.** | **Account owners, finance/admin** |
| **Booster Marketplace** | **List and discover creative, production, logistics, field, intelligence, sales, technical and campaign-management jobs.** | **Boosters, Booster businesses, advertisers** |
| **Booster work management** | **Apply for, assign, accept, execute, prove and close jobs.** | **Boosters, campaign managers, Advers operations** |
| **Payments & earnings** | **Separate subscription revenue, campaign payments, Booster service payments and referral commissions.** | **Advertisers, Boosters, finance/admin** |
| **Trust, support & disputes** | **Verification, ratings, proof review, complaints, disputes and account controls.** | **All users, Advers operations/admin** |
| **SME Hub** | **Provide subscriber access to the Advers SME Hub as stated in the Starter plan and inherited by higher plans.** | **Subscribers, SMEs** |


# 3. User roles and permissions

| **Role** | **What the role can do** | **Important controls** |
| - | - | - |
| **Visitor** | **View public product information and sign-up entry points.** | **Cannot create campaigns or accept jobs until registered.** |
| **Advertiser / Business owner** | **Manage permitted business profiles, discover opportunities, create campaigns, pay for placements and hire Booster services.** | **Subscription limits govern profiles/workspaces and advanced tools.** |
| **Advertiser team member** | **Collaborate on campaigns under a Business Pro account.** | **Up to three additional members; role permissions should be configurable.** |
| **Individual Booster** | **Create a service profile, list skills, discover jobs, apply/accept assignments, submit proof and view earnings.** | **Verification, location/service coverage and job-specific eligibility.** |
| **Booster business** | **Register a company/agency, receive contracts, manage workers and execute campaigns.** | **Business verification and worker/team permissions.** |
| **Booster team manager** | **Create teams, recruit members, assign tasks and coordinate campaign delivery.** | **Team members should only access jobs and data assigned to them.** |
| **Advers operations/admin** | **Review campaigns, verify Boosters, approve proof, manage disputes and administer opportunities.** | **Role-based access, audit trail and approval controls.** |
| **Finance/admin** | **Reconcile payments, refunds, commissions, service fees and withdrawals.** | **Restricted financial permissions and transaction logs.** |


Implementation recommendation: use role-based access control (RBAC), with account-level permissions and campaign/job-level permissions. A user may hold more than one role—for example, a business owner may also register as a Booster.

# 4. Marketing Access Plans

All three plans should be able to explore the Advers advertising ecosystem. Higher plans add capacity, control, reporting and support; they should not hide advertising opportunities from Starter users.

| **Plan** | **Monthly** | **Annual** | **Profiles** | **Active campaign workspaces** |
| - | - | - | - | - |
| **Starter Access** | **₦1,999** | **₦19,990** | **1** | **1** |
| **Growth Access** | **₦4,999** | **₦49,990** | **Up to 3** | **Up to 5** |
| **Business Pro Access** | **₦9,999** | **₦99,990** | **Up to 10** | **Up to 15** |


## 4.1 Starter Access — ₦1,999/month

For individuals, startups and small businesses. Positioning: “Your entry into professional marketing.”

- Create and manage one business profile.

- Explore all available advertising channels: billboard, FM radio, television, newspaper and podcast.

- Discover billboard advertising opportunities.

- Create and save campaign drafts; submit campaigns for review and booking.

- Access available advertising rates and placement information.

- Basic campaign tracking and status updates.

- Access to the Advers SME Hub and standard customer support.

- Limits: one business profile, one active campaign workspace, basic reporting and standard campaign processing.

## 4.2 Growth Access — ₦4,999/month

For growing businesses that need more marketing control. Includes everything in Starter, plus:

- Up to five active campaign workspaces and up to three business profiles.

- Advanced campaign creation and management.

- Campaign comparison tools and advanced performance reports where channel data is available.

- Priority access to available advertising opportunities (not a guarantee of availability or approval).

- Bulk SMS campaign management; SMS delivery charges are separate.

- Saved media partners and preferred placements.

- Marketing recommendations and campaign insights.

- Discounts on selected Advers service fees and priority customer support.

## 4.3 Business Pro Access — ₦9,999/month

For established businesses and organisations managing multiple campaigns. Includes everything in Growth, plus:

- Up to 15 active campaign workspaces and up to 10 business profiles or branches.

- Advanced campaign planning and scheduling; multi-location campaign management.

- Consolidated campaign reporting and advanced comparisons across channels.

- Premium placement discovery and priority booking assistance.

- Team access for up to three additional members; campaign collaboration and activity history.

- Custom campaign reports and dedicated priority support.

- Access to exclusive promotional opportunities when available.

- Best available discounts on selected Advers service fees.

## 4.4 Subscription rules and entitlement enforcement

- Store the active plan, billing period, start date, renewal date, payment state and entitlement limits on the account.

- Enforce plan limits when a user creates a business profile or active campaign workspace. Do not delete existing data when a plan is downgraded; prevent new activity above the lower plan limit and guide the user to upgrade or archive items.

- Annual prices are fixed at ₦19,990, ₦49,990 and ₦99,990 respectively. The source describes these as reduced total costs compared with monthly payment.

- Plan changes, failed renewals, cancellation, expiry, grace periods and refunds need explicit product/finance policy decisions before launch.

- Do not treat priority access, discounts or exclusive opportunities as guaranteed inventory or guaranteed campaign approval.

# 5. Advertiser campaign journey

The campaign experience should connect media discovery, campaign preparation, booking/payment and execution. The following is the recommended end-to-end workflow based on the source documents.

1. Create account and business profile. Check the selected subscription’s profile limit.

2. Browse advertising channels and opportunities: billboard, FM radio, television, newspaper and podcast. Show location, format, schedule, rates, requirements and availability only when verified data exists.

3. Create a campaign draft. Capture the advertiser’s objective, product/service, target audience, location(s), channel(s), dates, budget, creative assets and contact details.

4. Select a media opportunity or request assistance. Allow users to compare options where comparable information exists.

5. Submit for review/booking. Show a clear status such as Draft, Submitted, Under Review, Quote Required, Awaiting Payment, Confirmed, In Progress, Completed, Rejected or Cancelled. These statuses are implementation recommendations.

6. Present a quote or confirmed price. Separate media placement cost, Advers service fee/commission, production, logistics, SMS delivery and applicable taxes/payment charges.

7. Collect the required payment and confirm only the services/inventory actually secured.

8. Coordinate execution. Create Booster jobs when creative, printing, delivery, field promotion, technical installation, verification or campaign management is required.

9. Track progress and show available reporting. Reports must reflect actual information received from media partners and verified execution data.

10. Close the campaign, record outcomes, collect feedback and make relevant records available to the advertiser.

# 6. Advers Booster ecosystem

Advers Boosters is a marketing workforce and service-provider ecosystem connecting individuals, skilled professionals, independent workers, businesses and agencies with paid marketing opportunities. It goes beyond referral marketing: Boosters can directly execute work required to deliver campaigns.

A Booster may contribute skills, services, resources, networks or physical effort. A person does not need to own a billboard, be an influencer or own a marketing agency to participate.

## 6.1 Seven Booster categories

| **Category** | **Examples of services and roles** | **Typical deliverable** |
| - | - | - |
| **Creative Boosters** | **Graphic designers, video creators, motion graphics designers, copywriters, voice-over artists, photographers, AI creative specialists, brand identity designers, jingle producers, translators.** | **Approved creative files, scripts, recordings, photos, translations.** |
| **Production Boosters** | **Printing presses, flex/banner printers, billboard fabricators, signage makers, packaging/label makers, merchandise printers, LED display manufacturers/installers, vehicle branding, sticker/decal producers.** | **Printed, fabricated, branded or manufactured materials.** |
| **Distribution Boosters** | **Dispatch riders, logistics companies, truck owners, warehouse operators, installation/removal teams, event-material delivery, merchandising distributors, interstate delivery, mobile display operators.** | **Delivered materials, installation/removal, distribution confirmation.** |
| **Field Marketing Boosters** | **Door-to-door marketers, street promoters, brand activation/sampling agents, market canvassers, event/retail promoters, campus/community reps, sales reps, flyer distributors, trade-fair reps.** | **Verified engagements, sampling, visits, distribution or activation results.** |
| **Intelligence Boosters** | **Billboard scouts, location intelligence agents, competitor watchers, price intelligence agents, audience researchers, advertising auditors, foot-traffic observers, market opportunity scouts, retail intelligence agents.** | **Verified listings, price checks, location reports, audits and research.** |
| **Sales & Conversion Boosters** | **Business acquisition agents, advertising consultants, lead generation agents, influencer connectors, affiliate marketers, WhatsApp/email marketing specialists, community sales reps, corporate partnership and sponsorship agents.** | **Qualified leads, customer referrals, completed sales or partner introductions.** |
| **Experience & Technology Boosters** | **LED technicians, electrical installers, screen operators, event organisers, exhibition stand builders, sound engineers, livestream operators, drone advertising operators, digital/social media managers, web developers, QR/NFC specialists.** | **Working installations, live experiences, digital campaigns or technical verification.** |


## 6.2 Special Booster opportunities

| **Opportunity** | **Description / expected task** |
| - | - |
| **Billboard Finder** | **Submit advertising-space locations and introduce owners; reward may be paid for a verified listing or successful partnership.** |
| **Advertisement Witness** | **Independently verify that an advertisement is running using timestamped photos/videos and location evidence.** |
| **Business Connector** | **Introduce businesses that could create a useful commercial partnership, such as a restaurant and an event organiser.** |
| **Human Billboard** | **Wear approved branded clothing, carry promotional materials or operate branded bicycles/vehicles in agreed locations.** |
| **Street-to-Screen Agent** | **Help physical businesses connect customers to digital platforms using QR codes, campaigns and digital storefronts.** |
| **Mystery Customer** | **Visit a shop and report on customer service, product availability or a defined customer experience checklist.** |
| **Storefront Scout** | **Identify businesses that may need marketing and submit verified business details.** |
| **Consumer Voice Agent** | **Recruit willing participants for surveys, feedback sessions and product opinion studies.** |


# 7. Booster Marketplace and profiles

Create a dedicated Booster area inside the Advers application. It should function as a searchable opportunity marketplace, not merely a referral-code page.

Marketplace categories should include: Creative Jobs; Production Jobs; Logistics Jobs; Field Marketing; Intelligence Opportunities; Sales and Referrals; Technical Services; Campaign Management; and Team Opportunities.

## 7.1 Booster profile fields

- Full name or registered business name; profile photo or business logo.

- Location and service coverage.

- Skills and professional categories.

- Portfolio and previous work.

- Service prices or quotation options.

- Verification status.

- Customer ratings and reviews.

- Completed assignments.

- Earnings history.

- Available working hours.

- Payment information.

Recommended marketplace filters: category, task type, location/service radius, remote or on-site, budget/payment model, required skills, deadline, verification level and availability.

# 8. Booster teams and campaign execution

Boosters should be able to form teams and execute larger campaigns. Instead of assigning every task to one person, Advers can coordinate several service providers under one campaign. The advertiser should have one main relationship with Advers while Advers coordinates the participating Booster services.

## 8.1 Example: restaurant launch campaign in Port Harcourt

| **Team role** | **Responsibility** |
| - | - |
| **Campaign Manager** | **Coordinates the campaign, schedule, budget and hand-offs.** |
| **Graphic Designer** | **Creates approved promotional materials.** |
| **Printer** | **Produces flyers, banners or other physical materials.** |
| **Delivery Agent** | **Moves materials to the assigned locations.** |
| **Street Marketers** | **Promote the restaurant locally and complete assigned engagements.** |
| **Campaign Witness** | **Documents and verifies agreed execution.** |
| **Influencer Agent** | **Coordinates the influencer promotion component.** |


Recommended team workflow: campaign manager creates a team project; tasks are broken into work packages; each package has an owner, scope, deadline, fee and proof requirement; the manager monitors dependencies; Advers reviews exceptions and completion; payments are released according to approved terms.

# 9. Booster earnings, fees and payment logic

Different activities require different payment models. Keep referral commissions distinct from payment for actual services.

| **Activity** | **Source payment model** | **Suggested payment trigger** |
| - | - | - |
| **Customer referrals** | **Commission** | **Eligible customer transaction is completed and any refund/chargeback window is addressed.** |
| **Graphic design** | **Fixed job payment** | **Approved deliverable accepted.** |
| **Printing** | **Per order** | **Order delivered and accepted, or agreed production milestone.** |
| **Delivery** | **Per delivery** | **Proof of delivery accepted.** |
| **Door-to-door marketing** | **Per task or verified result** | **Required engagements/proof pass review.** |
| **Billboard discovery** | **Success commission** | **Listing/owner partnership meets defined success criteria.** |
| **Advertisement verification** | **Per verification** | **Evidence passes verification.** |
| **Influencer recruitment** | **Commission** | **Influencer is approved/onboarded or completes a qualifying campaign, as defined by terms.** |
| **Market research** | **Per approved report** | **Report passes quality review.** |
| **Campaign management** | **Project fee** | **Agreed milestone or project completion.** |
| **Team management** | **Management fee** | **Agreed project milestone or completion.** |
| **Lead generation** | **Per qualified lead** | **Lead meets the advertiser’s agreed qualification criteria.** |


The existing Booster referral commission concept of approximately 5–10% may remain one earning opportunity, subject to the applicable campaign terms. Do not apply 5–10% automatically to every Booster service or job.

## 9.1 Payment architecture and safeguards

- Maintain separate ledgers for subscription payments, advertiser campaign funds, media-partner payments, Booster job payments, referral commissions, Advers service fees, refunds and withdrawals.

- Where appropriate, use task escrow: advertiser funds are secured before a job starts, then released after completion and approval under clear terms.

- Show each Booster pending earnings, approved earnings, paid earnings, commissions and withdrawable balance.

- Record transaction references, payer, payee, amount, currency, fees, status, timestamps and related campaign/job.

- Provide payment failure, cancellation, refund, partial completion and dispute handling.

- Use a documented withdrawal review process and show expected processing status; do not show earnings as withdrawable before approval.

# 10. Verification, proof of performance and trust

Trust controls are essential because many Booster assignments happen physically and must be evidenced.

- Booster verification: verify identity, professional skills, business information and service locations where appropriate.

- Ratings: allow advertisers to rate Boosters after completed assignments; ratings should be tied to genuine completed work.

- Proof of performance: select evidence requirements by task—photographs, videos, GPS/location evidence, customer confirmation, reports, files or other relevant proof.

- Advertisement verification: support timestamped photos/videos and location evidence for billboard or other media execution checks.

- Reputation: use completed work, ratings, dispute history and verification status to help advertisers assess reliability.

- Disputes: provide structured reporting, evidence submission, review, decision, appeal/escalation and financial resolution.

- Fraud controls: detect duplicate evidence, suspicious location/time submissions, repeated fake leads and collusion; route suspicious cases to human review.

Privacy and safety recommendation: collect only the location and identity evidence required for a task, explain why it is collected, restrict access to authorised reviewers and define retention periods. Do not expose a Booster’s private contact or payment details publicly.

# 11. Admin and operations console

The technology team should provide an internal console so Advers can operate the marketplace and campaign supply chain safely.

- Manage users, roles, business profiles, subscriptions and plan entitlements.

- Review advertiser campaigns, media opportunities, quotes, bookings and campaign status.

- Create, edit, pause and close Booster job listings.

- Review Booster applications, profiles, portfolios and verification documents.

- Assign or approve Boosters and Booster teams for campaign work.

- Review submitted deliverables and proof of performance.

- Approve payments, commissions and withdrawals; reconcile transactions.

- Manage refunds, cancellations, disputes, ratings moderation and support cases.

- View audit logs for important account, campaign, job and financial actions.

- Configure categories, service locations, job templates, proof requirements and operational rules.

# 12. Suggested data model

The following is a recommended starting data model. The engineering team may adapt it to the selected stack, but relationships and auditability should be preserved.

| **Record / entity** | **Key fields or relationships** |
| - | - |
| **User** | **User ID, contact/authentication details, status, created date.** |
| **Role & permission** | **User ID, role, scope, permission set.** |
| **Business profile** | **Owner/account ID, business name, category, branches, location, verification.** |
| **Subscription** | **Account ID, plan, billing period, price, start/renewal dates, payment state, entitlements.** |
| **Campaign** | **Advertiser, objective, audience, channels, locations, schedule, budget, creative assets, status.** |
| **Media opportunity** | **Channel, provider/owner, format, location, rate, schedule/availability, requirements, status, data source.** |
| **Quote / booking** | **Campaign, selected opportunity, itemised costs, quote expiry, approval, booking reference, payment state.** |
| **Booster profile** | **User/business, categories, skills, service coverage, portfolio, rates, verification, ratings.** |
| **Booster job** | **Campaign, category, scope, location, deadline, budget, payment model, proof requirements, status.** |
| **Application / assignment** | **Job, applicant, selection status, assigned owner/team, acceptance timestamp.** |
| **Booster team** | **Team manager, members, roles, team jobs and permissions.** |
| **Deliverable / proof** | **Job, submitter, files, timestamp, location evidence if required, reviewer, decision.** |
| **Payment ledger** | **Transaction type, payer, payee, gross amount, fees, net amount, reference, status, timestamps.** |
| **Commission** | **Referrer, qualifying transaction, rate, amount, eligibility and payout status.** |
| **Rating / review** | **Completed job, reviewer, rated party, score, comments, moderation state.** |
| **Dispute** | **Related job/payment/campaign, parties, reason, evidence, status, resolution.** |
| **Notification** | **Recipient, event, channel, message, read state, created timestamp.** |
| **Audit log** | **Actor, action, affected record, before/after summary, timestamp.** |


# 13. Key status flows

## 13.1 Subscription status (recommended)

Pending payment → Active → Renewal due / Payment failed → Grace period (if adopted) → Expired or Cancelled. The exact grace-period and cancellation rules require a business decision.

## 13.2 Campaign status (recommended)

Draft → Submitted → Under review → Quote required / Awaiting advertiser approval → Awaiting payment → Confirmed → In progress → Completed. Alternative terminal or exception states: Rejected, Cancelled, On hold, Partially completed or Disputed.

## 13.3 Booster job status (recommended)

Draft → Published → Applications open → Assigned → Accepted → In progress → Submitted for review → Approved → Payment pending → Paid → Closed. Exception states: Rejected, Withdrawn, Cancelled, Disputed or Rework requested.

# 14. Notifications and communication

- Subscription payment confirmation, renewal reminders, failed payment and plan-limit warnings.

- Campaign submission, review decisions, quote updates, booking/payment confirmation and execution milestones.

- New matching Booster jobs, application updates, assignment, deadline reminders and task changes.

- Deliverable submitted, proof accepted/rejected, rework requested and job completion.

- Payment pending, approved, paid, commission earned and withdrawal updates.

- Verification decisions, ratings, dispute updates and support responses.

Recommended channels: in-app notifications first, with email/SMS/WhatsApp integrations considered according to consent, cost and product priorities. Bulk SMS is a Growth feature for campaign management; the delivery charge is separate.

# 15. Reporting and analytics

Reporting must be grounded in data that Advers or its media partners can actually supply. Avoid promising audience reach, sales or campaign outcomes that are not measured.

- Advertiser view: campaign status, spend, placements booked, execution evidence, available channel metrics and comparisons.

- Booster view: applications, jobs completed, ratings, pending/approved/paid earnings and commission history.

- Admin view: subscriptions, active accounts, campaign pipeline, channel demand, job completion, Booster supply, disputes, payments and operational performance.

- Business Pro: consolidated reporting across profiles/branches and campaign comparisons, subject to available channel data.

# 16. Non-functional requirements

- Security: secure authentication, role-based authorisation, protected payment and identity data, file access controls and audit logs.

- Reliability: prevent duplicate payment processing and duplicate job payouts; use idempotent payment callbacks where supported.

- Scalability: design marketplace search, campaign records, media opportunities and file storage to support growth across locations.

- Performance: paginate searchable lists; use filters and indexes for category, location, status and date.

- Accessibility and usability: mobile-first screens, clear task states, plain language and low-friction onboarding.

- Data integrity: enforce plan limits and valid state transitions on the server, not only in the app interface.

- Observability: log errors, payment events, approval actions and failed integrations without exposing secrets.

# 17. Recommended build phases

| **Phase** | **Build scope** | **Release objective** |
| - | - | - |
| **Phase 1 — Platform foundation** | **Authentication, roles, business profiles, subscription checkout/entitlements, channel discovery, campaign drafts/submission, basic admin review.** | **A business can subscribe, explore opportunities and submit a campaign.** |
| **Phase 2 — Campaign commerce** | **Quotes, booking confirmation, campaign payments, campaign status tracking, media partner/admin workflows and basic reporting.** | **Advers can process and manage a campaign transaction end to end.** |
| **Phase 3 — Booster marketplace MVP** | **Booster profiles, categories, job listings, search/filter, applications, assignment, messaging/notifications and proof submission.** | **Advertisers can source and manage Booster services.** |
| **Phase 4 — Payments and trust** | **Escrow/held funds where appropriate, earnings ledger, commissions, withdrawals, verification, ratings and disputes.** | **Booster work can be completed and paid with auditable controls.** |
| **Phase 5 — Teams and scale** | **Booster teams, multi-role collaboration, multi-location campaigns, advanced reports, automation and broader partner integrations.** | **Advers can coordinate complex campaigns across locations and providers.** |


# 18. Acceptance criteria for the first release

- A user can register, create a business profile and subscribe to one of the three plans.

- The system enforces each plan’s business-profile and active-workspace limits.

- Every plan can browse all supported advertising channel categories.

- An advertiser can create, save and submit a campaign and view its status.

- Campaign costs are displayed separately from subscription fees.

- An admin can review a campaign and update its status with an audit record.

- A Booster can create a profile, select categories, specify service coverage and submit portfolio details.

- An admin can publish a Booster job and a Booster can apply or be assigned.

- A job can specify deliverables, deadline, payment model and required proof.

- A Booster can submit deliverables/proof and an authorised reviewer can approve or reject with a reason.

- The system maintains separate subscription, campaign, service-payment and commission records.

- Users can see relevant notifications and the current status of their campaigns/jobs.

# 19. Decisions required before or during implementation

The source documents establish the product direction but do not specify every operational or technical policy. Product, Finance and Operations should make and document decisions on the following:

- Payment provider(s), supported payment methods, settlement timing, transaction fees, taxes and refund policy.

- Whether subscriptions renew automatically, grace-period duration, cancellation timing and downgrade behaviour.

- How media inventory, prices and availability are supplied and refreshed for each channel; which bookings are instant versus quote-based.

- Who approves campaigns, what content is prohibited, and expected review service levels.

- Whether Advers holds funds, uses a payment provider’s split/escrow capability or pays Boosters after receiving advertiser funds; legal and provider constraints must be checked.

- Exact definition of a qualified lead, successful billboard listing/partnership, verified engagement and commission-eligible referral.

- How the 5–10% referral commission is calculated, who pays it, qualifying transactions, exclusions and payout timing.

- Booster identity/business verification levels, required documents and geography-specific rules.

- Evidence standards by task, location precision, evidence retention and dispute/appeal timelines.

- Whether team managers can set member rates, whether Advers approves subcontracting, and who bears responsibility for failed work.

- Exact meaning of discounts, priority access, premium placement discovery and exclusive promotional opportunities.

- Support channels, response targets and operational staffing.

# 20. Product principles to preserve

- One platform should connect advertising opportunities with the people and services required to execute them.

- All subscribers can discover the Advers advertising ecosystem; higher plans provide more capacity and control.

- Subscription fees are separate from media placements and other campaign expenditure.

- Booster service payments and referral commissions are different earning models and must be accounted for separately.

- Campaign reporting must reflect available and verifiable data; never promise guaranteed reach, sales or results.

- Advers should support both individuals and established service-provider businesses, with teams for larger assignments.

- Verification, proof of performance, reputation and dispute resolution are core platform capabilities—not optional decoration.

# Appendix A — Source alignment

This specification consolidates the two supplied source documents: “Advers Marketing Access Plans” and “ADVERS / Booster Ecosystem.” The subscription prices, plan limits, channel list, Booster categories, example roles, earning models and stated 5–10% referral concept are carried forward from those materials. The proposed status names, data model, technical controls, build phases and acceptance criteria are implementation recommendations added to make the material actionable for the technology team.

# Appendix B — Brand language

ADVERS

ONE CLICK. UNLIMITED VISIBILITY.

ADVERS BOOSTERS

One Network. Thousands of Marketing Opportunities.

Your Skills. Your Network. Your Resources. Your Opportunities.
