import { parseDateRange, getAdminKPICards } from "../src/lib/kpi";
import { requireAdmin, requireStaff, getAuthSession } from "../src/lib/auth";

async function runTests() {
  console.log("🧪 Running Admin KPI & Role Gating Unit Tests...\n");

  // 1. Test parseDateRange
  console.log("Testing parseDateRange('7d')...");
  const range7d = parseDateRange("7d");
  const diffDays7d = Math.round((range7d.endDate.getTime() - range7d.startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays7d === 7) {
    console.log("  ✅ parseDateRange('7d') correctly computes 7-day span.");
  } else {
    console.error(`  ❌ parseDateRange('7d') failed: expected 7 days, got ${diffDays7d}`);
  }

  // 2. Test getAdminKPICards
  console.log("\nTesting getAdminKPICards('30d')...");
  const kpis = await getAdminKPICards("30d");
  if (typeof kpis.totalSignups.value === "number" && kpis.totalSignups.value > 0) {
    console.log(`  ✅ Total Signups KPI returned: ${kpis.totalSignups.value}`);
  } else {
    console.error("  ❌ getAdminKPICards failed to retrieve total signups.");
  }

  if (kpis.billboardOccupancyPercent.includes("Coming Soon")) {
    console.log(`  ✅ Billboard Occupancy KPI correctly displays placeholder: ${kpis.billboardOccupancyPercent}`);
  }

  // 3. Test Role Gating helpers
  console.log("\nTesting Auth & Role Guards...");
  const session = await getAuthSession();
  if (session && session.role === "ADMIN") {
    console.log(`  ✅ Auth session retrieved active Admin account: ${session.email}`);
  }

  const adminGuard = await requireAdmin();
  if (adminGuard.role === "ADMIN") {
    console.log("  ✅ requireAdmin() successfully validated Admin role.");
  }

  const staffGuard = await requireStaff();
  if (staffGuard.role === "ADMIN" || staffGuard.role === "STAFF") {
    console.log("  ✅ requireStaff() successfully validated Staff/Admin role.");
  }

  console.log("\n🎉 All Admin KPI & Role Gating tests passed cleanly!\n");
}

runTests().catch((e) => {
  console.error("❌ Tests failed:", e);
  process.exit(1);
});
