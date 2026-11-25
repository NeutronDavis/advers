import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { fromMoneyDTO, legacyMoneyDTO, toDecimalString } from "@/lib/money";
import { toCsv } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const transactions = await prisma.walletTransaction.findMany({
    where: { wallet: { userId: session.id } },
    orderBy: { createdAt: "desc" },
  });

  const rows = transactions.map((transaction) => {
    const money = fromMoneyDTO(
      legacyMoneyDTO(
        transaction.amount,
        transaction.amountMinor,
        transaction.currency,
        transaction.network === "POLYGON" ? "POLYGON" : undefined
      )
    );
    return {
      Date: transaction.createdAt.toISOString(),
      Type: transaction.type,
      Status: transaction.status,
      Currency: money.currency,
      Amount: toDecimalString(money),
      Reference: transaction.reference,
      Description: transaction.description,
      Provider: transaction.provider ?? "",
      ProviderReference: transaction.providerReference ?? "",
    };
  });

  const csv = toCsv(rows, [
    "Date",
    "Type",
    "Status",
    "Currency",
    "Amount",
    "Reference",
    "Description",
    "Provider",
    "ProviderReference",
  ]);

  const date = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="advers-wallet-statement-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
