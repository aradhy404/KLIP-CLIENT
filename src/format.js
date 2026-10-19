const inr = (paise) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(paise / 100);

export const formatMoney = (paise) => inr(Number(paise));

export const formatEntryDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export const formatToday = () =>
  new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

// Accepts what people actually type: spaces, dashes, +91, a leading 0.
// Returns a 10-digit string, or null when it can't be a mobile number.
export function cleanPhone(input) {
  let digits = String(input).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^\d{10}$/.test(digits) ? digits : null;
}

export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

// Totals come from the entries the API returned. Only open entries count:
// settled and disputed ones are history, not a balance.
export function summarize(entries) {
  const owedBy = new Set();
  let owed = 0;
  let owedUnconfirmed = 0;
  let youOwe = 0;
  let favours = 0;
  let toReview = 0;

  for (const e of entries) {
    const open = e.status === "pending" || e.status === "confirmed";

    if (e.role === "lender") {
      if (!open) continue;
      owedBy.add(e.counterparty_phone ?? e.other_party);
      if (e.type === "money") {
        owed += Number(e.amount_paise);
        if (e.status === "pending") owedUnconfirmed += 1;
      } else {
        favours += 1;
      }
    } else {
      // Entries addressed to me only count once I have confirmed them.
      if (e.status === "confirmed" && e.type === "money") youOwe += Number(e.amount_paise);
      if (e.status === "pending") toReview += 1;
    }
  }

  return { owed, owedUnconfirmed, youOwe, favours, toReview, people: owedBy.size };
}
