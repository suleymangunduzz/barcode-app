export function calculateEAN13Checksum(base12: string): number {
  if (!/^\d{12}$/.test(base12)) {
    throw new Error("EAN-13 base must be 12 digits");
  }

  let sum = 0;

  for (let i = 0; i < 12; i++) {
    const digit = Number(base12[i]);
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  return (10 - (sum % 10)) % 10;
}
