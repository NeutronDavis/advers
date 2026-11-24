import test from "node:test";
import assert from "node:assert/strict";
import {
  addMoney,
  compareMoney,
  formatMoney,
  formatMoneyShort,
  fromMoneyDTO,
  isZeroMoney,
  moneyFromLegacyNaira,
  parseMoney,
  parseMoneyOrDefault,
  subMoney,
  sumMoney,
  toMoneyDTO,
  zeroMoney,
} from "../money";

test("parseMoney converts NGN major units to kobo", () => {
  assert.equal(parseMoney("150000", "NGN").amountMinor, BigInt(15_000_000));
  assert.equal(parseMoney("1234.56", "NGN").amountMinor, BigInt(123_456));
  assert.equal(parseMoney("0.5", "NGN").amountMinor, BigInt(50));
});

test("parseMoney converts USDC up to six decimals", () => {
  assert.equal(parseMoney("1", "USDC").amountMinor, BigInt(1_000_000));
  assert.equal(parseMoney("0.000001", "USDC").amountMinor, BigInt(1));
  assert.equal(parseMoney("12.345678", "USDC").amountMinor, BigInt(12_345_678));
});

test("parseMoney accepts grouping commas and rejects excess precision", () => {
  assert.equal(parseMoney("1,250,000.75", "NGN").amountMinor, BigInt(125_000_075));
  assert.throws(() => parseMoney("1.999", "NGN"), /decimal places/);
  assert.throws(() => parseMoney("0.0000001", "USDC"), /decimal places/);
  assert.throws(() => parseMoney("abc", "NGN"), /Invalid amount/);
});

test("parseMoney does not silently round trailing zeros", () => {
  assert.equal(parseMoney("1.9900", "NGN").amountMinor, BigInt(199));
});

test("legacy Naira conversion multiplies by 100", () => {
  assert.equal(moneyFromLegacyNaira(485_000).amountMinor, BigInt(48_500_000));
  assert.equal(moneyFromLegacyNaira(0).currency, "NGN");
  assert.throws(() => moneyFromLegacyNaira(1.5), /whole integers/);
});

test("arithmetic stays exact and currency-safe", () => {
  const a = parseMoney("100.25", "USDC");
  const b = parseMoney("0.75", "USDC");
  assert.equal(addMoney(a, b).amountMinor, BigInt(101_000_000));
  assert.equal(subMoney(a, b).amountMinor, BigInt(99_500_000));
  assert.equal(compareMoney(a, b), 1);
  assert.equal(compareMoney(b, a), -1);
  assert.equal(compareMoney(a, a), 0);
  assert.ok(isZeroMoney(zeroMoney("NGN")));
  assert.equal(
    sumMoney([a, b, parseMoney("1", "USDC")], "USDC").amountMinor,
    BigInt(102_000_000)
  );

  assert.throws(
    () => addMoney(parseMoney("1", "NGN"), parseMoney("1", "USDC")),
    /Cannot combine/
  );
});

test("MoneyDTO round-trips through JSON without BigInt errors", () => {
  const money = parseMoney("25.5", "USDC");
  const dto = toMoneyDTO(money, "POLYGON");
  const json = JSON.stringify(dto);
  const parsed = JSON.parse(json) as typeof dto;
  assert.deepEqual(parsed, {
    amountMinor: "25500000",
    currency: "USDC",
    network: "POLYGON",
  });
  assert.equal(fromMoneyDTO(parsed).amountMinor, BigInt(25_500_000));
});

test("formatMoney prints exact values for both currencies", () => {
  assert.equal(formatMoney(parseMoney("150000", "NGN")), "₦150,000");
  assert.equal(formatMoney(parseMoney("150000.5", "NGN")), "₦150,000.5");
  assert.equal(formatMoney(parseMoney("1234.5", "USDC")), "USDC 1,234.50");
  assert.equal(formatMoney(parseMoney("0.000001", "USDC")), "USDC 0.000001");
  assert.equal(formatMoney(parseMoney("-42", "NGN")), "-₦42");
});

test("formatMoneyShort abbreviates without losing the currency label", () => {
  assert.equal(formatMoneyShort(parseMoney("150000", "NGN")), "₦150k");
  assert.equal(formatMoneyShort(parseMoney("2500000", "NGN")), "₦2.5M");
  assert.equal(formatMoneyShort(parseMoney("12.4", "USDC")), "USDC 12.40");
});

test("parseMoneyOrDefault treats empty input as zero", () => {
  assert.equal(parseMoneyOrDefault("", "NGN").amountMinor, BigInt(0));
  assert.equal(parseMoneyOrDefault(null, "USDC").amountMinor, BigInt(0));
  assert.equal(parseMoneyOrDefault(undefined, "USDC").currency, "USDC");
});
