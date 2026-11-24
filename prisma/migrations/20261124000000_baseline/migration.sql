-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('CLIENT', 'STAFF', 'ADMIN') NOT NULL DEFAULT 'CLIENT',
    `orgRole` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `status` ENUM('UNVERIFIED', 'PROSPECT', 'ACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'UNVERIFIED',
    `source` VARCHAR(191) NULL DEFAULT 'ORGANIC',
    `utmSource` VARCHAR(191) NULL,
    `utmCampaign` VARCHAR(191) NULL,
    `emailVerifiedAt` DATETIME(3) NULL,
    `profileCompleteAt` DATETIME(3) NULL,
    `termsAcceptedAt` DATETIME(3) NULL,
    `termsVersion` VARCHAR(191) NULL DEFAULT '1.0',
    `lastLoginAt` DATETIME(3) NULL,
    `clientId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_email_idx`(`email`),
    INDEX `User_clientId_idx`(`clientId`),
    INDEX `User_createdAt_idx`(`createdAt`),
    INDEX `User_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Client` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `industry` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invitation` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `orgRole` ENUM('OWNER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `invitedById` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `acceptedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invitation_tokenHash_key`(`tokenHash`),
    INDEX `Invitation_tokenHash_idx`(`tokenHash`),
    INDEX `Invitation_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL DEFAULT 'WEBSITE',
    `utmSource` VARCHAR(191) NULL,
    `utmCampaign` VARCHAR(191) NULL,
    `packageInterest` VARCHAR(191) NULL,
    `budgetRange` VARCHAR(191) NULL,
    `timeline` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `convertedClientId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lead_createdAt_idx`(`createdAt`),
    INDEX `Lead_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('ENQUIRY', 'FEEDBACK', 'COMPLAINT', 'BILLBOARD_ENQUIRY', 'OTHER') NOT NULL DEFAULT 'ENQUIRY',
    `status` ENUM('NEW', 'IN_REVIEW', 'REPLIED', 'RESOLVED', 'ARCHIVED', 'SPAM') NOT NULL DEFAULT 'NEW',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `rating` INTEGER NULL,
    `packageInterest` VARCHAR(191) NULL,
    `source` VARCHAR(191) NULL DEFAULT 'WEBSITE',
    `isTestimonial` BOOLEAN NOT NULL DEFAULT false,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `internalNote` TEXT NULL,
    `assignedToId` VARCHAR(191) NULL,
    `leadId` VARCHAR(191) NULL,
    `repliedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Feedback_status_idx`(`status`),
    INDEX `Feedback_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Package` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `priceMin` INTEGER NOT NULL,
    `priceMax` INTEGER NOT NULL,
    `inclusionsJson` TEXT NOT NULL,
    `defaultMilestonesJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Package_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Engagement` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `type` ENUM('DIGITAL_PACKAGE', 'ECOSYSTEM', 'BILLBOARD', 'CARE_PLAN') NOT NULL DEFAULT 'DIGITAL_PACKAGE',
    `packageId` VARCHAR(191) NULL,
    `status` ENUM('PROSPECT', 'QUALIFIED', 'QUOTE_SENT', 'ACCEPTED', 'ONBOARDING_IN_PROGRESS', 'IN_PRODUCTION', 'REVIEW', 'LAUNCHED', 'ACTIVE', 'PAUSED', 'COMPLETED') NOT NULL DEFAULT 'PROSPECT',
    `onboardingProgress` INTEGER NOT NULL DEFAULT 0,
    `waitingOnClient` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Engagement_clientId_idx`(`clientId`),
    INDEX `Engagement_status_idx`(`status`),
    INDEX `Engagement_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OnboardingResponse` (
    `id` VARCHAR(191) NOT NULL,
    `engagementId` VARCHAR(191) NOT NULL,
    `stepKey` VARCHAR(191) NOT NULL,
    `dataJson` TEXT NOT NULL,
    `completedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `OnboardingResponse_engagementId_stepKey_key`(`engagementId`, `stepKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceNumber` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `engagementId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `serviceType` VARCHAR(191) NOT NULL DEFAULT 'DIGITAL_PACKAGE',
    `status` ENUM('DRAFT', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `dueDate` DATETIME(3) NOT NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Invoice_invoiceNumber_key`(`invoiceNumber`),
    INDEX `Invoice_clientId_idx`(`clientId`),
    INDEX `Invoice_campaignId_idx`(`campaignId`),
    INDEX `Invoice_status_idx`(`status`),
    INDEX `Invoice_dueDate_idx`(`dueDate`),
    INDEX `Invoice_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'PAYSTACK',
    `reference` VARCHAR(191) NOT NULL,
    `status` ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL DEFAULT 'SUCCESS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_reference_key`(`reference`),
    INDEX `Payment_invoiceId_idx`(`invoiceId`),
    INDEX `Payment_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` VARCHAR(191) NOT NULL,
    `quoteNumber` VARCHAR(191) NOT NULL,
    `leadId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `mediaCost` INTEGER NOT NULL DEFAULT 0,
    `adversFee` INTEGER NOT NULL DEFAULT 0,
    `productionCost` INTEGER NOT NULL DEFAULT 0,
    `logisticsCost` INTEGER NOT NULL DEFAULT 0,
    `smsCost` INTEGER NOT NULL DEFAULT 0,
    `taxAmount` INTEGER NOT NULL DEFAULT 0,
    `bookingReference` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `status` ENUM('DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'SENT',
    `openedAt` DATETIME(3) NULL,
    `approvedAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Quote_quoteNumber_key`(`quoteNumber`),
    INDEX `Quote_status_idx`(`status`),
    INDEX `Quote_campaignId_idx`(`campaignId`),
    INDEX `Quote_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Renewal` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `engagementId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `renewalDate` DATETIME(3) NOT NULL,
    `status` ENUM('UPCOMING', 'RENEWED', 'CANCELLED') NOT NULL DEFAULT 'UPCOMING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Renewal_clientId_idx`(`clientId`),
    INDEX `Renewal_status_idx`(`status`),
    INDEX `Renewal_renewalDate_idx`(`renewalDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ActivityLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `metadata` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ActivityLog_userId_idx`(`userId`),
    INDEX `ActivityLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `actorId` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `targetType` VARCHAR(191) NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `details` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_actorId_idx`(`actorId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Campaign` (
    `id` VARCHAR(191) NOT NULL,
    `campaignNumber` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `channel` ENUM('DIGITAL_BILLBOARD', 'STATIC_BILLBOARD', 'FM_RADIO', 'TELEVISION', 'NEWSPAPER', 'PODCAST', 'ADBOOSTERS', 'INFLUENCER') NOT NULL,
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTE_REQUIRED', 'AWAITING_APPROVAL', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'ON_HOLD', 'PARTIALLY_COMPLETED', 'DISPUTED', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'REVISION_REQUESTED') NOT NULL DEFAULT 'PENDING_REVIEW',
    `objective` VARCHAR(191) NOT NULL,
    `targetLocation` VARCHAR(191) NOT NULL,
    `budget` INTEGER NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `creativeAssetUrl` VARCHAR(191) NULL,
    `creativeAssetType` VARCHAR(191) NULL,
    `arconCode` VARCHAR(191) NULL,
    `complianceNotes` TEXT NULL,
    `channelConfigJson` TEXT NULL,
    `productService` VARCHAR(191) NULL,
    `targetAudience` TEXT NULL,
    `contactName` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `notes` TEXT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `businessProfileId` VARCHAR(191) NULL,
    `inventoryId` VARCHAR(191) NULL,
    `mediaSlotId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Campaign_campaignNumber_key`(`campaignNumber`),
    INDEX `Campaign_userId_idx`(`userId`),
    INDEX `Campaign_clientId_idx`(`clientId`),
    INDEX `Campaign_businessProfileId_idx`(`businessProfileId`),
    INDEX `Campaign_mediaSlotId_idx`(`mediaSlotId`),
    INDEX `Campaign_status_idx`(`status`),
    INDEX `Campaign_channel_idx`(`channel`),
    INDEX `Campaign_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaInventory` (
    `id` VARCHAR(191) NOT NULL,
    `inventoryCode` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `channel` ENUM('DIGITAL_BILLBOARD', 'STATIC_BILLBOARD', 'FM_RADIO', 'TELEVISION', 'NEWSPAPER', 'PODCAST', 'ADBOOSTERS', 'INFLUENCER') NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `locationDetails` VARCHAR(191) NOT NULL,
    `screenSpecs` VARCHAR(191) NULL,
    `loopCapacity` VARCHAR(191) NULL,
    `availableSlots` INTEGER NOT NULL DEFAULT 1,
    `ratePerUnit` INTEGER NOT NULL,
    `unitType` VARCHAR(191) NOT NULL,
    `vendorName` VARCHAR(191) NOT NULL,
    `vendorContact` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'OPERATIONAL',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MediaInventory_inventoryCode_key`(`inventoryCode`),
    INDEX `MediaInventory_channel_idx`(`channel`),
    INDEX `MediaInventory_city_idx`(`city`),
    INDEX `MediaInventory_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaSlot` (
    `id` VARCHAR(191) NOT NULL,
    `inventoryId` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `startTime` VARCHAR(191) NULL,
    `endTime` VARCHAR(191) NULL,
    `daysOfWeek` VARCHAR(191) NULL,
    `date` DATETIME(3) NULL,
    `rate` INTEGER NOT NULL,
    `unitType` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `booked` INTEGER NOT NULL DEFAULT 0,
    `status` VARCHAR(191) NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MediaSlot_inventoryId_idx`(`inventoryId`),
    INDEX `MediaSlot_status_idx`(`status`),
    INDEX `MediaSlot_date_idx`(`date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProofOfPerformance` (
    `id` VARCHAR(191) NOT NULL,
    `proofCode` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fileUrl` VARCHAR(191) NOT NULL,
    `thumbnailUrl` VARCHAR(191) NULL,
    `caption` VARCHAR(191) NULL,
    `broadcastTimestamp` DATETIME(3) NULL,
    `verifiedBy` VARCHAR(191) NOT NULL,
    `verifiedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProofOfPerformance_proofCode_key`(`proofCode`),
    INDEX `ProofOfPerformance_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdBooster` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `networkType` VARCHAR(191) NOT NULL,
    `audienceReach` INTEGER NOT NULL DEFAULT 0,
    `bankName` VARCHAR(191) NULL,
    `bankAccountNumber` VARCHAR(191) NULL,
    `bankAccountName` VARCHAR(191) NULL,
    `totalEarnedCommission` INTEGER NOT NULL DEFAULT 0,
    `fraudRisk` VARCHAR(191) NOT NULL DEFAULT 'LOW',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AdBooster_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterLink` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `clicksCount` INTEGER NOT NULL DEFAULT 0,
    `sharesCount` INTEGER NOT NULL DEFAULT 0,
    `conversionsCount` INTEGER NOT NULL DEFAULT 0,
    `commissionAccrued` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BoosterLink_code_key`(`code`),
    INDEX `BoosterLink_campaignId_idx`(`campaignId`),
    INDEX `BoosterLink_boosterId_idx`(`boosterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MediaSettlement` (
    `id` VARCHAR(191) NOT NULL,
    `settlementNumber` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `vendorName` VARCHAR(191) NOT NULL,
    `grossAmount` INTEGER NOT NULL,
    `vendorPayout` INTEGER NOT NULL,
    `adversFee` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'READY_FOR_PAYOUT',
    `settledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MediaSettlement_settlementNumber_key`(`settlementNumber`),
    INDEX `MediaSettlement_campaignId_idx`(`campaignId`),
    INDEX `MediaSettlement_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Wallet` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `availableBalance` INTEGER NOT NULL DEFAULT 0,
    `escrowBalance` INTEGER NOT NULL DEFAULT 0,
    `totalSpent` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Wallet_userId_key`(`userId`),
    INDEX `Wallet_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WalletTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `walletId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'SUCCESS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `WalletTransaction_reference_key`(`reference`),
    INDEX `WalletTransaction_walletId_idx`(`walletId`),
    INDEX `WalletTransaction_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `tagline` VARCHAR(191) NULL,
    `monthlyPrice` INTEGER NOT NULL,
    `annualPrice` INTEGER NOT NULL,
    `profileLimit` INTEGER NOT NULL,
    `workspaceLimit` INTEGER NOT NULL,
    `teamSeatLimit` INTEGER NOT NULL DEFAULT 0,
    `featuresJson` TEXT NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Plan_key_key`(`key`),
    INDEX `Plan_active_idx`(`active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `billingPeriod` ENUM('MONTHLY', 'ANNUAL') NOT NULL DEFAULT 'MONTHLY',
    `status` ENUM('PENDING_PAYMENT', 'ACTIVE', 'RENEWAL_DUE', 'PAYMENT_FAILED', 'GRACE_PERIOD', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING_PAYMENT',
    `price` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `renewalDate` DATETIME(3) NOT NULL,
    `cancelledAt` DATETIME(3) NULL,
    `paymentReference` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Subscription_clientId_idx`(`clientId`),
    INDEX `Subscription_status_idx`(`status`),
    INDEX `Subscription_renewalDate_idx`(`renewalDate`),
    INDEX `Subscription_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BusinessProfile` (
    `id` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `branchesJson` TEXT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('DRAFT', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'DRAFT',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BusinessProfile_clientId_idx`(`clientId`),
    INDEX `BusinessProfile_status_idx`(`status`),
    INDEX `BusinessProfile_isPrimary_idx`(`isPrimary`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignStatusEvent` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `fromStatus` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTE_REQUIRED', 'AWAITING_APPROVAL', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'ON_HOLD', 'PARTIALLY_COMPLETED', 'DISPUTED', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'REVISION_REQUESTED') NULL,
    `toStatus` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'QUOTE_REQUIRED', 'AWAITING_APPROVAL', 'AWAITING_PAYMENT', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED', 'CANCELLED', 'ON_HOLD', 'PARTIALLY_COMPLETED', 'DISPUTED', 'PENDING_REVIEW', 'APPROVED', 'SCHEDULED', 'ACTIVE', 'REVISION_REQUESTED') NOT NULL,
    `actorId` VARCHAR(191) NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CampaignStatusEvent_campaignId_idx`(`campaignId`),
    INDEX `CampaignStatusEvent_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `businessName` VARCHAR(191) NULL,
    `logoUrl` VARCHAR(191) NULL,
    `bio` TEXT NULL,
    `isBusiness` BOOLEAN NOT NULL DEFAULT false,
    `categoriesJson` TEXT NOT NULL,
    `skillsJson` TEXT NULL,
    `coverageJson` TEXT NULL,
    `portfolioJson` TEXT NULL,
    `ratesJson` TEXT NULL,
    `paymentInfoJson` TEXT NULL,
    `availableHours` VARCHAR(191) NULL,
    `verificationStatus` ENUM('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'UNVERIFIED',
    `verificationDocumentsJson` TEXT NULL,
    `verificationNotes` TEXT NULL,
    `verificationSubmittedNote` TEXT NULL,
    `verificationLevel` VARCHAR(191) NULL,
    `verificationSubmittedAt` DATETIME(3) NULL,
    `verificationReviewedAt` DATETIME(3) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `verifiedById` VARCHAR(191) NULL,
    `fraudRisk` VARCHAR(191) NOT NULL DEFAULT 'LOW',
    `fraudNotes` TEXT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `ratingAvg` DOUBLE NOT NULL DEFAULT 0,
    `ratingCount` INTEGER NOT NULL DEFAULT 0,
    `completedJobs` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BoosterProfile_userId_key`(`userId`),
    INDEX `BoosterProfile_verificationStatus_idx`(`verificationStatus`),
    INDEX `BoosterProfile_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterJob` (
    `id` VARCHAR(191) NOT NULL,
    `jobNumber` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `clientId` VARCHAR(191) NULL,
    `businessProfileId` VARCHAR(191) NULL,
    `category` ENUM('CREATIVE', 'PRODUCTION', 'LOGISTICS', 'FIELD_MARKETING', 'INTELLIGENCE', 'SALES_REFERRALS', 'TECHNICAL', 'CAMPAIGN_MANAGEMENT', 'TEAM_OPPORTUNITY') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `scope` TEXT NULL,
    `location` VARCHAR(191) NOT NULL,
    `isRemote` BOOLEAN NOT NULL DEFAULT false,
    `deadline` DATETIME(3) NULL,
    `budget` INTEGER NOT NULL,
    `paymentModel` ENUM('FIXED', 'COMMISSION', 'PER_ORDER', 'PER_DELIVERY', 'PER_TASK', 'PER_VERIFICATION', 'PER_REPORT', 'PER_LEAD', 'PROJECT_FEE', 'MANAGEMENT_FEE') NOT NULL DEFAULT 'FIXED',
    `proofRequirementsJson` TEXT NULL,
    `requiredSkillsJson` TEXT NULL,
    `verificationLevel` VARCHAR(191) NULL,
    `status` ENUM('DRAFT', 'PUBLISHED', 'APPLICATIONS_OPEN', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'SUBMITTED_FOR_REVIEW', 'APPROVED', 'PAYMENT_PENDING', 'PAID', 'CLOSED', 'REJECTED', 'WITHDRAWN', 'CANCELLED', 'DISPUTED', 'REWORK_REQUESTED') NOT NULL DEFAULT 'DRAFT',
    `createdById` VARCHAR(191) NOT NULL,
    `assignedBoosterId` VARCHAR(191) NULL,
    `teamId` VARCHAR(191) NULL,
    `publishedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BoosterJob_jobNumber_key`(`jobNumber`),
    INDEX `BoosterJob_status_idx`(`status`),
    INDEX `BoosterJob_category_idx`(`category`),
    INDEX `BoosterJob_location_idx`(`location`),
    INDEX `BoosterJob_deadline_idx`(`deadline`),
    INDEX `BoosterJob_clientId_idx`(`clientId`),
    INDEX `BoosterJob_campaignId_idx`(`campaignId`),
    INDEX `BoosterJob_teamId_idx`(`teamId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterApplication` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `status` ENUM('APPLIED', 'SHORTLISTED', 'ASSIGNED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'APPLIED',
    `coverNote` TEXT NULL,
    `proposedFee` INTEGER NULL,
    `appliedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `assignedAt` DATETIME(3) NULL,

    INDEX `BoosterApplication_status_idx`(`status`),
    UNIQUE INDEX `BoosterApplication_jobId_boosterId_key`(`jobId`, `boosterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterDeliverable` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `filesJson` TEXT NOT NULL,
    `notes` TEXT NULL,
    `locationEvidence` VARCHAR(191) NULL,
    `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewerId` VARCHAR(191) NULL,
    `decision` ENUM('PENDING', 'APPROVED', 'REJECTED', 'REWORK_REQUESTED') NOT NULL DEFAULT 'PENDING',
    `decisionReason` TEXT NULL,
    `fraudRisk` VARCHAR(191) NOT NULL DEFAULT 'LOW',
    `reviewedAt` DATETIME(3) NULL,

    INDEX `BoosterDeliverable_jobId_idx`(`jobId`),
    INDEX `BoosterDeliverable_boosterId_idx`(`boosterId`),
    INDEX `BoosterDeliverable_decision_idx`(`decision`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notification` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `event` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `link` VARCHAR(191) NULL,
    `channel` ENUM('IN_APP', 'EMAIL', 'SMS', 'WHATSAPP') NOT NULL DEFAULT 'IN_APP',
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Notification_userId_idx`(`userId`),
    INDEX `Notification_readAt_idx`(`readAt`),
    INDEX `Notification_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LedgerEntry` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SUBSCRIPTION', 'CAMPAIGN_PAYMENT', 'MEDIA_PAYOUT', 'BOOSTER_PAYMENT', 'COMMISSION', 'ADVERS_FEE', 'REFUND', 'WITHDRAWAL', 'ADJUSTMENT') NOT NULL,
    `status` ENUM('PENDING', 'HELD', 'RELEASED', 'PAID', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `payerId` VARCHAR(191) NULL,
    `payeeId` VARCHAR(191) NULL,
    `grossAmount` INTEGER NOT NULL,
    `feeAmount` INTEGER NOT NULL DEFAULT 0,
    `netAmount` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `reference` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `jobId` VARCHAR(191) NULL,
    `boosterId` VARCHAR(191) NULL,
    `metadataJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LedgerEntry_reference_key`(`reference`),
    INDEX `LedgerEntry_type_idx`(`type`),
    INDEX `LedgerEntry_status_idx`(`status`),
    INDEX `LedgerEntry_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterEarning` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `paidAmount` INTEGER NOT NULL DEFAULT 0,
    `paymentModel` ENUM('FIXED', 'COMMISSION', 'PER_ORDER', 'PER_DELIVERY', 'PER_TASK', 'PER_VERIFICATION', 'PER_REPORT', 'PER_LEAD', 'PROJECT_FEE', 'MANAGEMENT_FEE') NOT NULL DEFAULT 'FIXED',
    `status` ENUM('PENDING', 'APPROVED', 'PAID', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `reference` VARCHAR(191) NOT NULL,
    `approvedAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `withdrawalId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BoosterEarning_jobId_key`(`jobId`),
    UNIQUE INDEX `BoosterEarning_reference_key`(`reference`),
    INDEX `BoosterEarning_boosterId_idx`(`boosterId`),
    INDEX `BoosterEarning_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Withdrawal` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `amount` INTEGER NOT NULL,
    `status` ENUM('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PAID', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `method` VARCHAR(191) NOT NULL DEFAULT 'BANK_TRANSFER',
    `accountDetailsJson` TEXT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Withdrawal_reference_key`(`reference`),
    INDEX `Withdrawal_boosterId_idx`(`boosterId`),
    INDEX `Withdrawal_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rating` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `ratedBoosterId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `comment` TEXT NULL,
    `moderationState` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Rating_ratedBoosterId_idx`(`ratedBoosterId`),
    INDEX `Rating_moderationState_idx`(`moderationState`),
    UNIQUE INDEX `Rating_jobId_reviewerId_key`(`jobId`, `reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispute` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `openedById` VARCHAR(191) NOT NULL,
    `againstBoosterId` VARCHAR(191) NULL,
    `reason` TEXT NOT NULL,
    `evidenceJson` TEXT NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'APPEALED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    `resolution` TEXT NULL,
    `reviewedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Dispute_status_idx`(`status`),
    INDEX `Dispute_jobId_idx`(`jobId`),
    INDEX `Dispute_campaignId_idx`(`campaignId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterTeam` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `managerId` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BoosterTeam_managerId_idx`(`managerId`),
    INDEX `BoosterTeam_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterTeamMember` (
    `id` VARCHAR(191) NOT NULL,
    `teamId` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `role` ENUM('MANAGER', 'MEMBER') NOT NULL DEFAULT 'MEMBER',
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BoosterTeamMember_boosterId_idx`(`boosterId`),
    UNIQUE INDEX `BoosterTeamMember_teamId_boosterId_key`(`teamId`, `boosterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationPreference` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `inApp` BOOLEAN NOT NULL DEFAULT true,
    `email` BOOLEAN NOT NULL DEFAULT true,
    `sms` BOOLEAN NOT NULL DEFAULT false,
    `whatsapp` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NotificationPreference_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InfluencerProfile` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `handle` VARCHAR(191) NOT NULL,
    `niche` VARCHAR(191) NOT NULL,
    `platform` VARCHAR(191) NOT NULL,
    `followers` INTEGER NOT NULL DEFAULT 0,
    `engagementRate` DOUBLE NULL,
    `rateCard` INTEGER NULL,
    `bio` TEXT NULL,
    `avatarUrl` VARCHAR(191) NULL,
    `audienceJson` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InfluencerProfile_userId_key`(`userId`),
    INDEX `InfluencerProfile_niche_idx`(`niche`),
    INDEX `InfluencerProfile_verified_idx`(`verified`),
    INDEX `InfluencerProfile_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InfluencerRequest` (
    `id` VARCHAR(191) NOT NULL,
    `influencerId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NULL,
    `brief` TEXT NOT NULL,
    `budget` INTEGER NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'REQUESTED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `respondedAt` DATETIME(3) NULL,

    INDEX `InfluencerRequest_influencerId_idx`(`influencerId`),
    INDEX `InfluencerRequest_clientId_idx`(`clientId`),
    INDEX `InfluencerRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdversPost` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `imageUrl` TEXT NULL,
    `ctaLabel` VARCHAR(191) NULL,
    `ctaUrl` TEXT NULL,
    `sponsorName` VARCHAR(191) NOT NULL,
    `sponsorLogoUrl` TEXT NULL,
    `category` VARCHAR(191) NULL,
    `placement` VARCHAR(191) NOT NULL DEFAULT 'DASHBOARD',
    `status` ENUM('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `startsAt` DATETIME(3) NULL,
    `endsAt` DATETIME(3) NULL,
    `targetAudienceJson` TEXT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AdversPost_status_idx`(`status`),
    INDEX `AdversPost_placement_idx`(`placement`),
    INDEX `AdversPost_startsAt_idx`(`startsAt`),
    INDEX `AdversPost_endsAt_idx`(`endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invitation` ADD CONSTRAINT `Invitation_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Engagement` ADD CONSTRAINT `Engagement_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Engagement` ADD CONSTRAINT `Engagement_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `Package`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OnboardingResponse` ADD CONSTRAINT `OnboardingResponse_engagementId_fkey` FOREIGN KEY (`engagementId`) REFERENCES `Engagement`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_engagementId_fkey` FOREIGN KEY (`engagementId`) REFERENCES `Engagement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_leadId_fkey` FOREIGN KEY (`leadId`) REFERENCES `Lead`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Renewal` ADD CONSTRAINT `Renewal_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Renewal` ADD CONSTRAINT `Renewal_engagementId_fkey` FOREIGN KEY (`engagementId`) REFERENCES `Engagement`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ActivityLog` ADD CONSTRAINT `ActivityLog_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_businessProfileId_fkey` FOREIGN KEY (`businessProfileId`) REFERENCES `BusinessProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `MediaInventory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Campaign` ADD CONSTRAINT `Campaign_mediaSlotId_fkey` FOREIGN KEY (`mediaSlotId`) REFERENCES `MediaSlot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaSlot` ADD CONSTRAINT `MediaSlot_inventoryId_fkey` FOREIGN KEY (`inventoryId`) REFERENCES `MediaInventory`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProofOfPerformance` ADD CONSTRAINT `ProofOfPerformance_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterLink` ADD CONSTRAINT `BoosterLink_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterLink` ADD CONSTRAINT `BoosterLink_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `AdBooster`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MediaSettlement` ADD CONSTRAINT `MediaSettlement_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wallet` ADD CONSTRAINT `Wallet_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WalletTransaction` ADD CONSTRAINT `WalletTransaction_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `Wallet`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BusinessProfile` ADD CONSTRAINT `BusinessProfile_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignStatusEvent` ADD CONSTRAINT `CampaignStatusEvent_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignStatusEvent` ADD CONSTRAINT `CampaignStatusEvent_actorId_fkey` FOREIGN KEY (`actorId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterProfile` ADD CONSTRAINT `BoosterProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterProfile` ADD CONSTRAINT `BoosterProfile_verifiedById_fkey` FOREIGN KEY (`verifiedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterJob` ADD CONSTRAINT `BoosterJob_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterJob` ADD CONSTRAINT `BoosterJob_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterJob` ADD CONSTRAINT `BoosterJob_businessProfileId_fkey` FOREIGN KEY (`businessProfileId`) REFERENCES `BusinessProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterJob` ADD CONSTRAINT `BoosterJob_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterJob` ADD CONSTRAINT `BoosterJob_assignedBoosterId_fkey` FOREIGN KEY (`assignedBoosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterJob` ADD CONSTRAINT `BoosterJob_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `BoosterTeam`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterApplication` ADD CONSTRAINT `BoosterApplication_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterApplication` ADD CONSTRAINT `BoosterApplication_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterDeliverable` ADD CONSTRAINT `BoosterDeliverable_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterDeliverable` ADD CONSTRAINT `BoosterDeliverable_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterDeliverable` ADD CONSTRAINT `BoosterDeliverable_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerEntry` ADD CONSTRAINT `LedgerEntry_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEarning` ADD CONSTRAINT `BoosterEarning_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEarning` ADD CONSTRAINT `BoosterEarning_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEarning` ADD CONSTRAINT `BoosterEarning_withdrawalId_fkey` FOREIGN KEY (`withdrawalId`) REFERENCES `Withdrawal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Withdrawal` ADD CONSTRAINT `Withdrawal_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Withdrawal` ADD CONSTRAINT `Withdrawal_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rating` ADD CONSTRAINT `Rating_ratedBoosterId_fkey` FOREIGN KEY (`ratedBoosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_openedById_fkey` FOREIGN KEY (`openedById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_againstBoosterId_fkey` FOREIGN KEY (`againstBoosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterTeam` ADD CONSTRAINT `BoosterTeam_managerId_fkey` FOREIGN KEY (`managerId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterTeamMember` ADD CONSTRAINT `BoosterTeamMember_teamId_fkey` FOREIGN KEY (`teamId`) REFERENCES `BoosterTeam`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterTeamMember` ADD CONSTRAINT `BoosterTeamMember_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotificationPreference` ADD CONSTRAINT `NotificationPreference_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfluencerProfile` ADD CONSTRAINT `InfluencerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfluencerRequest` ADD CONSTRAINT `InfluencerRequest_influencerId_fkey` FOREIGN KEY (`influencerId`) REFERENCES `InfluencerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfluencerRequest` ADD CONSTRAINT `InfluencerRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InfluencerRequest` ADD CONSTRAINT `InfluencerRequest_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdversPost` ADD CONSTRAINT `AdversPost_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

