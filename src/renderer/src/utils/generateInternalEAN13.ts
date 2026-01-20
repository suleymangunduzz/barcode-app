import { calculateEAN13Checksum } from "@/utils/ean13";

export function generateInternalEAN13(): string {
  const prefix = "20";

  let payload = "";
  for (let i = 0; i < 10; i++) {
    payload += Math.floor(Math.random() * 10);
  }

  const base12 = prefix + payload;
  const checksum = calculateEAN13Checksum(base12);

  return base12 + checksum;
}
