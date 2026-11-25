/**
 * Phase 2 wallet smoke test.
 *
 * Usage: npm run wallet:smoke
 *
 * Creates a temporary advertiser, funds a USDC wallet through the mock
 * on-ramp processor, withdraws the full balance through a payout destination,
 * asserts the ledger moved correctly, then removes all test rows.
 */
import { randomBytes } from "crypto";
import { prisma } from "../src/lib/prisma";
import { parseMoney, type Money } from "../src/lib/money";
import {
  ensureUsdcWallet,
  getUsdcAvailableMinor,
} from "../src/server/data/wallet";
import { postLedgerTransaction } from "../src/server/ledger";
import { settleOnramp, settlePayout } from "../src/server/payments/processing";
import { advertiserAccountKey, WALLET_NETWORK } from "../src/lib/wallet";

const suffix = randomBytes(4).toString("hex");

async function main(): Promise<void> {
  const user = await prisma.user.create({
    data: {
      email: `wallet-smoke-${suffix}@example.com`,
      name: "Wallet Smoke",
      role: "CLIENT",
      status: "ACTIVE",
    },
  });

  const wallet = await ensureUsdcWallet(user.id);
  const providerReference = `smoke_onramp_${suffix}`;
  const fundReference = `SMOKE-FUND-${suffix}`;
  const amount: Money = parseMoney("25", "USDC");

  const funding = await prisma.walletTransaction.create({
    data: {
      walletId: wallet.id,
      type: "ONRAMP_PENDING",
      amount: 0,
      currency: "USDC",
      network: WALLET_NETWORK,
      amountMinor: amount.amountMinor,
      reference: fundReference,
      idempotencyKey: `smoke-fund:${suffix}`,
      provider: "mock",
      providerReference,
      description: "Smoke funding",
      status: "PENDING",
    },
  });

  let withdrawalId = "";

  try {
    await settleOnramp({
      eventId: `smoke-onramp-${suffix}`,
      type: "onramp.completed",
      data: { provider: "mock", providerReference },
    });

    const availableAfterFunding = await getUsdcAvailableMinor(user.id);
    if (availableAfterFunding !== amount.amountMinor) {
      throw new Error(
        `Expected ${amount.amountMinor} after funding, got ${availableAfterFunding}.`
      );
    }

    const destination = await prisma.payoutDestination.create({
      data: {
        userId: user.id,
        label: "Smoke wallet",
        address: `0x${suffix.padEnd(40, "0")}`,
        network: WALLET_NETWORK,
        isDefault: true,
      },
    });

    const withdrawalReference = `smoke_payout_${suffix}`;
    const withdrawal = await prisma.advertiserWithdrawal.create({
      data: {
        userId: user.id,
        destinationId: destination.id,
        amountMinor: amount.amountMinor,
        feeMinor: BigInt(0),
        currency: "USDC",
        network: WALLET_NETWORK,
        status: "PROCESSING",
        provider: "mock",
        providerReference: withdrawalReference,
        idempotencyKey: `smoke-withdrawal:${suffix}`,
      },
    });
    withdrawalId = withdrawal.id;

    await postLedgerTransaction({
      type: "WITHDRAWAL",
      reference: `LEDGER-WDR-${withdrawal.id}`,
      idempotencyKey: `withdrawal:${withdrawal.id}`,
      lines: [
        {
          account: {
            userId: user.id,
            type: "AVAILABLE",
            currency: "USDC",
            network: WALLET_NETWORK,
          },
          direction: "DEBIT",
          money: amount,
        },
        {
          account: {
            userId: user.id,
            type: "PAYOUT_CLEARING",
            currency: "USDC",
            network: WALLET_NETWORK,
          },
          direction: "CREDIT",
          money: amount,
        },
      ],
    });

    await settlePayout({
      eventId: `smoke-payout-${suffix}`,
      type: "payout.paid",
      data: { providerReference: withdrawalReference },
    });

    const [finalBalance, finalWithdrawal] = await Promise.all([
      getUsdcAvailableMinor(user.id),
      prisma.advertiserWithdrawal.findUnique({ where: { id: withdrawal.id } }),
    ]);

    if (finalBalance !== BigInt(0)) {
      throw new Error(`Expected zero balance after withdrawal, got ${finalBalance}.`);
    }
    if (finalWithdrawal?.status !== "PAID") {
      throw new Error(`Expected PAID withdrawal, got ${finalWithdrawal?.status}.`);
    }

    console.log("Wallet smoke test passed.");
    console.log(`  funded: ${amount.amountMinor} USDC minor units`);
    console.log(`  wallet: ${wallet.id}`);
    console.log(`  withdrawal: ${withdrawal.id} (${finalWithdrawal.status})`);
  } finally {
    const transactionIds = await prisma.ledgerTransaction.findMany({
      where: {
        reference: {
          in: [
            `LEDGER-ONRAMP-${funding.id}`,
            `LEDGER-WDR-${withdrawalId}`,
            `LEDGER-PAYOUT-${withdrawalId}`,
          ],
        },
      },
      select: { id: true, type: true },
    });
    const ids = transactionIds.map((transaction) => transaction.id);
    if (ids.length > 0) {
      await prisma.ledgerLine.deleteMany({ where: { transactionId: { in: ids } } });
      await prisma.ledgerTransaction.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.ledgerAccount.deleteMany({ where: { userId: user.id } });
    await prisma.advertiserWithdrawal.deleteMany({ where: { userId: user.id } });
    await prisma.payoutDestination.deleteMany({ where: { userId: user.id } });
    await prisma.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
    await prisma.wallet.deleteMany({ where: { userId: user.id } });
    await prisma.user.deleteMany({ where: { id: user.id } });
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error(
    "Wallet smoke test failed:",
    error instanceof Error ? error.message : error
  );
  process.exitCode = 1;
});
