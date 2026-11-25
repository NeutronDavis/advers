-- CreateTable
CREATE TABLE `MediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `ownerId` VARCHAR(191) NOT NULL,
    `kind` ENUM('IMAGE', 'VIDEO', 'AUDIO', 'DOCUMENT') NOT NULL,
    `storageKey` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `mime` VARCHAR(191) NOT NULL,
    `bytes` INTEGER NOT NULL,
    `width` INTEGER NULL,
    `height` INTEGER NULL,
    `durationSec` INTEGER NULL,
    `metadataSource` VARCHAR(191) NOT NULL DEFAULT 'SERVER',
    `checksum` VARCHAR(191) NOT NULL,
    `scanStatus` ENUM('PENDING', 'CLEAN', 'INFECTED', 'NEEDS_REVIEW') NOT NULL DEFAULT 'PENDING',
    `status` ENUM('UPLOADED', 'VALIDATED', 'REJECTED') NOT NULL DEFAULT 'UPLOADED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MediaAsset_storageKey_key`(`storageKey`),
    INDEX `MediaAsset_ownerId_idx`(`ownerId`),
    INDEX `MediaAsset_kind_idx`(`kind`),
    INDEX `MediaAsset_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampaignMediaAsset` (
    `id` VARCHAR(191) NOT NULL,
    `campaignId` VARCHAR(191) NOT NULL,
    `assetId` VARCHAR(191) NOT NULL,
    `fieldKey` VARCHAR(191) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CampaignMediaAsset_assetId_idx`(`assetId`),
    UNIQUE INDEX `CampaignMediaAsset_campaignId_assetId_key`(`campaignId`, `assetId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ChannelSpec` (
    `id` VARCHAR(191) NOT NULL,
    `channel` ENUM('DIGITAL_BILLBOARD', 'STATIC_BILLBOARD', 'FM_RADIO', 'TELEVISION', 'NEWSPAPER', 'PODCAST', 'ADBOOSTERS', 'INFLUENCER') NOT NULL,
    `fieldKey` VARCHAR(191) NOT NULL,
    `label` VARCHAR(191) NOT NULL,
    `inputType` VARCHAR(191) NOT NULL,
    `required` BOOLEAN NOT NULL DEFAULT false,
    `optionsJson` TEXT NULL,
    `mediaKind` VARCHAR(191) NULL,
    `accept` VARCHAR(191) NULL,
    `maxBytes` INTEGER NULL,
    `minWidth` INTEGER NULL,
    `maxWidth` INTEGER NULL,
    `minHeight` INTEGER NULL,
    `maxHeight` INTEGER NULL,
    `minDurationSec` INTEGER NULL,
    `maxDurationSec` INTEGER NULL,
    `helpText` TEXT NULL,
    `groupName` VARCHAR(191) NOT NULL DEFAULT 'Channel requirements',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ChannelSpec_channel_active_idx`(`channel`, `active`),
    UNIQUE INDEX `ChannelSpec_channel_fieldKey_key`(`channel`, `fieldKey`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MediaAsset` ADD CONSTRAINT `MediaAsset_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignMediaAsset` ADD CONSTRAINT `CampaignMediaAsset_campaignId_fkey` FOREIGN KEY (`campaignId`) REFERENCES `Campaign`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampaignMediaAsset` ADD CONSTRAINT `CampaignMediaAsset_assetId_fkey` FOREIGN KEY (`assetId`) REFERENCES `MediaAsset`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

