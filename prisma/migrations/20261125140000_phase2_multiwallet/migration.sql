-- Backfill the new non-null network before altering the column.
UPDATE `Wallet` SET `network` = 'NONE' WHERE `network` IS NULL;

-- A user may now hold one wallet per currency/network (legacy NGN + USDC).
DROP INDEX `Wallet_userId_key` ON `Wallet`;

ALTER TABLE `Wallet` MODIFY `network` VARCHAR(191) NOT NULL DEFAULT 'NONE';

CREATE UNIQUE INDEX `Wallet_userId_currency_network_key` ON `Wallet`(`userId`, `currency`, `network`);
