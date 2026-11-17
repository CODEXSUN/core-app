import { z } from "zod";
// Exact nonnegative decimal strings; four fractional digits are stored without binary floating-point conversion.
export const decimalSchema = z
  .string()
  .regex(
    /^\d{1,14}(?:\.\d{1,4})?$/,
    "Use a nonnegative number with at most four decimal places.",
  )
  .transform((value) => {
    const [whole, fraction = ""] = value.split(".");
    return BigInt(whole).toString() + "." + fraction.padEnd(4, "0");
  });
