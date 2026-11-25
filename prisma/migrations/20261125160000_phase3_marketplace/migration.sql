-- AlterTable
ALTER TABLE `BoosterProfile` ADD COLUMN `availabilityStatus` ENUM('AVAILABLE', 'BUSY', 'UNAVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    ADD COLUMN `coverUrl` VARCHAR(191) NULL,
    ADD COLUMN `handle` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `responseTimeHours` INTEGER NULL,
    ADD COLUMN `startingPrice` INTEGER NULL;

-- CreateTable
CREATE TABLE `BoosterLike` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BoosterLike_boosterId_idx`(`boosterId`),
    INDEX `BoosterLike_userId_idx`(`userId`),
    UNIQUE INDEX `BoosterLike_boosterId_userId_key`(`boosterId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterComment` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `body` TEXT NOT NULL,
    `moderationState` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BoosterComment_boosterId_moderationState_idx`(`boosterId`, `moderationState`),
    INDEX `BoosterComment_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterReview` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `reviewerId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NULL,
    `score` INTEGER NOT NULL,
    `body` TEXT NULL,
    `verified` BOOLEAN NOT NULL DEFAULT false,
    `moderationState` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BoosterReview_boosterId_moderationState_idx`(`boosterId`, `moderationState`),
    INDEX `BoosterReview_reviewerId_idx`(`reviewerId`),
    INDEX `BoosterReview_jobId_idx`(`jobId`),
    UNIQUE INDEX `BoosterReview_boosterId_reviewerId_key`(`boosterId`, `reviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterRecommendation` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `BoosterRecommendation_boosterId_idx`(`boosterId`),
    INDEX `BoosterRecommendation_userId_idx`(`userId`),
    UNIQUE INDEX `BoosterRecommendation_boosterId_userId_key`(`boosterId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketplaceReport` (
    `id` VARCHAR(191) NOT NULL,
    `reporterId` VARCHAR(191) NOT NULL,
    `targetType` ENUM('PROFILE', 'COMMENT', 'REVIEW', 'RECOMMENDATION') NOT NULL,
    `targetId` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NULL,
    `reason` TEXT NOT NULL,
    `details` TEXT NULL,
    `status` ENUM('OPEN', 'REVIEWING', 'RESOLVED', 'DISMISSED') NOT NULL DEFAULT 'OPEN',
    `reviewedById` VARCHAR(191) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `resolution` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `MarketplaceReport_status_idx`(`status`),
    INDEX `MarketplaceReport_targetType_targetId_idx`(`targetType`, `targetId`),
    INDEX `MarketplaceReport_reporterId_idx`(`reporterId`),
    INDEX `MarketplaceReport_boosterId_idx`(`boosterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `BoosterProfile_handle_key` ON `BoosterProfile`(`handle`);

-- AddForeignKey
ALTER TABLE `BoosterLike` ADD CONSTRAINT `BoosterLike_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterLike` ADD CONSTRAINT `BoosterLike_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterComment` ADD CONSTRAINT `BoosterComment_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterComment` ADD CONSTRAINT `BoosterComment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterReview` ADD CONSTRAINT `BoosterReview_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterReview` ADD CONSTRAINT `BoosterReview_reviewerId_fkey` FOREIGN KEY (`reviewerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterReview` ADD CONSTRAINT `BoosterReview_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `BoosterJob`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterRecommendation` ADD CONSTRAINT `BoosterRecommendation_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterRecommendation` ADD CONSTRAINT `BoosterRecommendation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketplaceReport` ADD CONSTRAINT `MarketplaceReport_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketplaceReport` ADD CONSTRAINT `MarketplaceReport_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketplaceReport` ADD CONSTRAINT `MarketplaceReport_reviewedById_fkey` FOREIGN KEY (`reviewedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

