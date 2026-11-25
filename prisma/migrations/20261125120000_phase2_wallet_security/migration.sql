-- AlterTable
ALTER TABLE `Wallet` ADD COLUMN `status` ENUM('ACTIVE', 'FROZEN', 'CLOSED') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `WalletTransaction` ADD COLUMN `completedAt` DATETIME(3) NULL,
    ADD COLUMN `idempotencyKey` VARCHAR(191) NULL,
    ADD COLUMN `metadataJson` TEXT NULL,
    ADD COLUMN `provider` VARCHAR(191) NULL,
    ADD COLUMN `providerReference` VARCHAR(191) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateTable
CREATE TABLE `PayoutDestination` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('USDC_WALLET', 'BANK_ACCOUNT') NOT NULL DEFAULT 'USDC_WALLET',
    `label` VARCHAR(191) NOT NULL,
    `network` VARCHAR(191) NOT NULL DEFAULT 'POLYGON',
    `address` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'DISABLED') NOT NULL DEFAULT 'ACTIVE',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PayoutDestination_userId_idx`(`userId`),
    INDEX `PayoutDestination_status_idx`(`status`),
    UNIQUE INDEX `PayoutDestination_userId_network_address_key`(`userId`, `network`, `address`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AdvertiserWithdrawal` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `destinationId` VARCHAR(191) NULL,
    `amountMinor` BIGINT NOT NULL,
    `feeMinor` BIGINT NOT NULL DEFAULT 0,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'USDC',
    `network` VARCHAR(191) NOT NULL DEFAULT 'POLYGON',
    `status` ENUM('REQUESTED', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `provider` VARCHAR(191) NULL,
    `providerReference` VARCHAR(191) NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `notes` TEXT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdvertiserWithdrawal_idempotencyKey_key`(`idempotencyKey`),
    INDEX `AdvertiserWithdrawal_userId_idx`(`userId`),
    INDEX `AdvertiserWithdrawal_status_idx`(`status`),
    INDEX `AdvertiserWithdrawal_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TwoFactorSecret` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `encryptedSecret` TEXT NOT NULL,
    `recoveryCodesJson` TEXT NOT NULL,
    `confirmedAt` DATETIME(3) NULL,
    `lastUsedAt` DATETIME(3) NULL,
    `disabledAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TwoFactorSecret_userId_key`(`userId`),
    INDEX `TwoFactorSecret_confirmedAt_idx`(`confirmedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StepUpToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `resourceId` VARCHAR(191) NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `StepUpToken_tokenHash_key`(`tokenHash`),
    INDEX `StepUpToken_userId_action_idx`(`userId`, `action`),
    INDEX `StepUpToken_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `WalletTransaction_idempotencyKey_key` ON `WalletTransaction`(`idempotencyKey`);

-- AddForeignKey
ALTER TABLE `PayoutDestination` ADD CONSTRAINT `PayoutDestination_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvertiserWithdrawal` ADD CONSTRAINT `AdvertiserWithdrawal_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AdvertiserWithdrawal` ADD CONSTRAINT `AdvertiserWithdrawal_destinationId_fkey` FOREIGN KEY (`destinationId`) REFERENCES `PayoutDestination`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TwoFactorSecret` ADD CONSTRAINT `TwoFactorSecret_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `StepUpToken` ADD CONSTRAINT `StepUpToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

