-- CreateTable
CREATE TABLE `BoosterService` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `platform` VARCHAR(191) NULL,
    `priceMin` INTEGER NULL,
    `priceMax` INTEGER NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `deliveryDays` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BoosterService_boosterId_active_idx`(`boosterId`, `active`),
    INDEX `BoosterService_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterPackage` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `price` INTEGER NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `deliveryDays` INTEGER NULL,
    `revisions` INTEGER NULL,
    `includesJson` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BoosterPackage_boosterId_active_idx`(`boosterId`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PortfolioItem` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `mediaAssetId` VARCHAR(191) NULL,
    `externalUrl` VARCHAR(191) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PortfolioItem_boosterId_idx`(`boosterId`),
    INDEX `PortfolioItem_mediaAssetId_idx`(`mediaAssetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoosterEngagementRequest` (
    `id` VARCHAR(191) NOT NULL,
    `boosterId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `clientId` VARCHAR(191) NULL,
    `campaignId` VARCHAR(191) NULL,
    `serviceId` VARCHAR(191) NULL,
    `packageId` VARCHAR(191) NULL,
    `title` VARCHAR(191) NOT NULL,
    `brief` TEXT NOT NULL,
    `budget` INTEGER NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `timeline` VARCHAR(191) NULL,
    `contactEmail` VARCHAR(191) NULL,
    `contactPhone` VARCHAR(191) NULL,
    `status` ENUM('REQUESTED', 'VIEWED', 'ACCEPTED', 'DECLINED', 'CONVERTED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `responseNote` TEXT NULL,
    `respondedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BoosterEngagementRequest_boosterId_status_idx`(`boosterId`, `status`),
    INDEX `BoosterEngagementRequest_userId_idx`(`userId`),
    INDEX `BoosterEngagementRequest_clientId_idx`(`clientId`),
    INDEX `BoosterEngagementRequest_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `BoosterService` ADD CONSTRAINT `BoosterService_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterPackage` ADD CONSTRAINT `BoosterPackage_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PortfolioItem` ADD CONSTRAINT `PortfolioItem_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PortfolioItem` ADD CONSTRAINT `PortfolioItem_mediaAssetId_fkey` FOREIGN KEY (`mediaAssetId`) REFERENCES `MediaAsset`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEngagementRequest` ADD CONSTRAINT `BoosterEngagementRequest_boosterId_fkey` FOREIGN KEY (`boosterId`) REFERENCES `BoosterProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEngagementRequest` ADD CONSTRAINT `BoosterEngagementRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEngagementRequest` ADD CONSTRAINT `BoosterEngagementRequest_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEngagementRequest` ADD CONSTRAINT `BoosterEngagementRequest_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEngagementRequest` ADD CONSTRAINT `BoosterEngagementRequest_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `BoosterService`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoosterEngagementRequest` ADD CONSTRAINT `BoosterEngagementRequest_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `BoosterPackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

