import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrencySymbol(country: string): string {
  const c = (country || "").toLowerCase().trim();

  if (
    c.includes("united kingdom") ||
    c.includes("uk") ||
    c.includes("britain") ||
    c.includes("scotland") ||
    c.includes("england") ||
    c.includes("wales") ||
    c.includes("northern ireland")
  ) return "£";

  if (
    c.includes("ireland") ||
    c.includes("france") ||
    c.includes("germany") ||
    c.includes("spain") ||
    c.includes("italy") ||
    c.includes("netherlands") ||
    c.includes("portugal") ||
    c.includes("belgium") ||
    c.includes("austria") ||
    c.includes("greece") ||
    c.includes("finland") ||
    c.includes("luxembourg")
  ) return "€";

  if (c.includes("canada")) return "CA$";
  return "$";
}

