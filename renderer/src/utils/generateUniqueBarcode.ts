import { generateInternalEAN13 } from "./generateInternalEAN13";

export async function generateUniqueBarcode(maxRetries = 15): Promise<string> {
  for (let i = 0; i < maxRetries; i++) {
    const barcode = generateInternalEAN13();

    const item = await window.api.getItemByBarcode(barcode);
    if (!item) {
      return barcode;
    }
  }

  throw new Error("Unable to generate unique internal barcode");
}
