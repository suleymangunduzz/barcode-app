export function computeEAN13CheckDigit(code12: string): string | null {
  if (!/^[0-9]{12}$/.test(code12)) return null;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code12[i], 10);
    sum += i % 2 === 0 ? digit : digit * 3;
  }
  const check = (10 - (sum % 10)) % 10;
  return String(check);
}

export function toEAN13(code: string): string | null {
  if (!code) return null;
  if (!/^[0-9]+$/.test(code)) return null;
  if (code.length === 13) return code;
  if (code.length === 12) {
    const cd = computeEAN13CheckDigit(code);
    return cd == null ? null : code + cd;
  }
  return null;
}
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
