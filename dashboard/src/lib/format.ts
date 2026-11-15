export function formatCr(value: number): string {
  if (value >= 100_000) {
    return `₹${(value / 100_000).toFixed(2)} L Cr`;
  }
  if (value >= 1_000) {
    return `₹${(value / 1_000).toFixed(1)}K Cr`;
  }
  return `₹${value.toFixed(0)} Cr`;
}

export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatInr(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-IN").format(Math.round(value));
}
