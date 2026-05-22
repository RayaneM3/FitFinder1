import xss from "xss";

const XSS_OPTIONS = {
  whiteList: {} as Record<string, string[]>, // Allow NO HTML tags at all
  stripIgnoreTag: true,
  stripIgnoreTagBody: ["script", "style"] as string[],
};

/** Strip all HTML and script content from a single string. */
export function sanitizeString(input: string): string {
  return xss(input, XSS_OPTIONS);
}

/** Sanitize all string values in an object (shallow + array elements). */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = { ...obj };
  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      result[key] = sanitizeString(result[key]);
    } else if (Array.isArray(result[key])) {
      result[key] = result[key].map((item: any) =>
        typeof item === "string" ? sanitizeString(item) : item
      );
    }
  }
  return result as T;
}
