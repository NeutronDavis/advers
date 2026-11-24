-- AlterTable
ALTER TABLE `User` ADD COLUMN `avatarUrl` VARCHAR(191) NULL,
    ADD COLUMN `coverUrl` VARCHAR(191) NULL,
    ADD COLUMN `sessionVersion` INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN `themePreference` ENUM('LIGHT', 'DARK', 'SYSTEM') NOT NULL DEFAULT 'SYSTEM',
    ADD COLUMN `username` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Invoice` ADD COLUMN `amountMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN';

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `amountMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    ADD COLUMN `network` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Quote` ADD COLUMN `amountMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN';

-- AlterTable
ALTER TABLE `Campaign` ADD COLUMN `budgetMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN';

-- AlterTable
ALTER TABLE `Wallet` ADD COLUMN `availableBalanceMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    ADD COLUMN `escrowBalanceMinor` BIGINT NULL,
    ADD COLUMN `network` VARCHAR(191) NULL,
    ADD COLUMN `totalSpentMinor` BIGINT NULL;

-- AlterTable
ALTER TABLE `WalletTransaction` ADD COLUMN `amountMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    ADD COLUMN `network` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoosterJob` ADD COLUMN `budgetMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN';

-- AlterTable
ALTER TABLE `LedgerEntry` ADD COLUMN `feeAmountMinor` BIGINT NULL,
    ADD COLUMN `grossAmountMinor` BIGINT NULL,
    ADD COLUMN `netAmountMinor` BIGINT NULL,
    ADD COLUMN `network` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `BoosterEarning` ADD COLUMN `amountMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    ADD COLUMN `paidAmountMinor` BIGINT NULL;

-- AlterTable
ALTER TABLE `Withdrawal` ADD COLUMN `amountMinor` BIGINT NULL,
    ADD COLUMN `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    ADD COLUMN `network` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `LedgerAccount` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `type` ENUM('AVAILABLE', 'ESCROW', 'PLATFORM_FEE', 'PAYOUT_CLEARING', 'PROVIDER_SETTLEMENT') NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'NGN',
    `network` VARCHAR(191) NOT NULL DEFAULT 'NONE',
    `balanceMinor` BIGINT NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `LedgerAccount_key_key`(`key`),
    INDEX `LedgerAccount_userId_type_currency_network_idx`(`userId`, `type`, `currency`, `network`),
    INDEX `LedgerAccount_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LedgerTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('SUBSCRIPTION', 'CAMPAIGN_PAYMENT', 'MEDIA_PAYOUT', 'BOOSTER_PAYMENT', 'COMMISSION', 'ADVERS_FEE', 'REFUND', 'WITHDRAWAL', 'ADJUSTMENT') NOT NULL,
    `status` ENUM('PENDING', 'POSTED', 'SETTLED', 'FAILED', 'REVERSED') NOT NULL DEFAULT 'PENDING',
    `reference` VARCHAR(191) NOT NULL,
    `idempotencyKey` VARCHAR(191) NOT NULL,
    `fxQuoteId` VARCHAR(191) NULL,
    `metadataJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `postedAt` DATETIME(3) NULL,

    UNIQUE INDEX `LedgerTransaction_reference_key`(`reference`),
    UNIQUE INDEX `LedgerTransaction_idempotencyKey_key`(`idempotencyKey`),
    INDEX `LedgerTransaction_status_idx`(`status`),
    INDEX `LedgerTransaction_type_idx`(`type`),
    INDEX `LedgerTransaction_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LedgerLine` (
    `id` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `direction` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `amountMinor` BIGINT NOT NULL,
    `currency` VARCHAR(191) NOT NULL,
    `network` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `LedgerLine_transactionId_idx`(`transactionId`),
    INDEX `LedgerLine_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FxQuote` (
    `id` VARCHAR(191) NOT NULL,
    `baseCurrency` VARCHAR(191) NOT NULL,
    `quoteCurrency` VARCHAR(191) NOT NULL,
    `rate` DECIMAL(24, 12) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'EXPIRED', 'CONSUMED') NOT NULL DEFAULT 'ACTIVE',
    `expiresAt` DATETIME(3) NOT NULL,
    `lockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `consumedAt` DATETIME(3) NULL,
    `metadataJson` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FxQuote_status_idx`(`status`),
    INDEX `FxQuote_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProviderEvent` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(191) NOT NULL,
    `eventId` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `payloadJson` TEXT NOT NULL,
    `signatureValid` BOOLEAN NOT NULL DEFAULT false,
    `status` ENUM('RECEIVED', 'PROCESSED', 'FAILED', 'IGNORED') NOT NULL DEFAULT 'RECEIVED',
    `processedAt` DATETIME(3) NULL,
    `error` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ProviderEvent_status_idx`(`status`),
    INDEX `ProviderEvent_createdAt_idx`(`createdAt`),
    UNIQUE INDEX `ProviderEvent_provider_eventId_key`(`provider`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AddForeignKey
ALTER TABLE `LedgerAccount` ADD CONSTRAINT `LedgerAccount_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerTransaction` ADD CONSTRAINT `LedgerTransaction_fxQuoteId_fkey` FOREIGN KEY (`fxQuoteId`) REFERENCES `FxQuote`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerLine` ADD CONSTRAINT `LedgerLine_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `LedgerTransaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LedgerLine` ADD CONSTRAINT `LedgerLine_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `LedgerAccount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

