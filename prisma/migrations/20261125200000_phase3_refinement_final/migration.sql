-- AlterTable
ALTER TABLE `BoosterEngagementRequest` ADD COLUMN `viewedAt` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `BoosterProfile` ADD COLUMN `rankingBoost` DOUBLE NOT NULL DEFAULT 0,
    ADD COLUMN `rankingNote` TEXT NULL,
    ADD COLUMN `sponsored` BOOLEAN NOT NULL DEFAULT false;

