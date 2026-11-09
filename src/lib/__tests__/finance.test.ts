import test from "node:test";
import assert from "node:assert/strict";
import {
  allocateWithdrawal,
  approvedRemaining,
  computeWithdrawable,
} from "../finance";

const earnings = [
  { id: "e1", amount: 70000, paidAmount: 0, status: "APPROVED" },
  { id: "e2", amount: 250000, paidAmount: 0, status: "PENDING" },
  { id: "e3", amount: 40000, paidAmount: 40000, status: "PAID" },
];

test("approvedRemaining ignores pending and paid earnings", () => {
  assert.equal(approvedRemaining(earnings), 70000);
});

test("computeWithdrawable subtracts pending withdrawals", () => {
  assert.equal(computeWithdrawable(earnings, 0), 70000);
  assert.equal(computeWithdrawable(earnings, 30000), 40000);
  assert.equal(computeWithdrawable(earnings, 90000), 0);
});

test("allocateWithdrawal supports partial payouts", () => {
  const allocations = allocateWithdrawal(30000, earnings);
  assert.deepEqual(allocations, [
    { earningId: "e1", paidAmount: 30000, fullyPaid: false },
  ]);
});

test("allocateWithdrawal pays fully and rolls to the next earning", () => {
  const twoApproved = [
    { id: "e1", amount: 20000, paidAmount: 0, status: "APPROVED" },
    { id: "e2", amount: 30000, paidAmount: 0, status: "APPROVED" },
  ];
  const allocations = allocateWithdrawal(35000, twoApproved);
  assert.deepEqual(allocations, [
    { earningId: "e1", paidAmount: 20000, fullyPaid: true },
    { earningId: "e2", paidAmount: 15000, fullyPaid: false },
  ]);
});

test("a fully paid earning cannot be withdrawn twice", () => {
  const paid = [
    { id: "e1", amount: 70000, paidAmount: 70000, status: "PAID" },
  ];
  assert.equal(computeWithdrawable(paid, 0), 0);
  assert.deepEqual(allocateWithdrawal(10000, paid), []);
});
