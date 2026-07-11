/**
 * Automatic text field cleaning
 * Removes leading and trailing whitespace from all string values in an object
 */
export function trimFormData<T extends Record<string, any>>(data: T): T {
  const trimmed = { ...data } as Record<string, any>;

  for (const key in trimmed) {
    if (typeof trimmed[key] === "string") {
      trimmed[key] = (trimmed[key] as string).trim();
    }
  }

  return trimmed as T;
}

/**
 * Moroccan phone number normalization
 * Converts all valid formats to standard format: 0666947166
 *
 * Accepted formats:
 * - Local with 0: 0666947166
 * - Local without 0: 666947166
 * - International +212: +212666947166
 * - International 00212: 00212666947166
 * - Formatted variants: 06 66 94 71 66, 06-66-94-71-66, (212) 666947166, etc.
 */
export function normalizePhoneNumber(phone: string): string | null {
  if (!phone || typeof phone !== "string") {
    return null;
  }

  // Remove all formatting characters (spaces, dashes, parentheses, dots)
  let normalized = phone.replace(/[\s\-\(\)\.\+]/g, "");

  // Handle international formats
  if (normalized.startsWith("212")) {
    // +212 or 00212 formats (after removing +)
    normalized = "0" + normalized.substring(3);
  }

  // Validate length and format
  if (normalized.length === 9 && /^\d{9}$/.test(normalized)) {
    // 9 digits without leading 0, add it
    normalized = "0" + normalized;
  }

  // Validate final format
  if (normalized.length !== 10 || !/^0\d{9}$/.test(normalized)) {
    return null; // Invalid format
  }

  // Validate Moroccan phone number prefixes
  // Valid prefixes: 06, 07, 08, 09, 05
  const prefix = normalized.substring(0, 2);
  const validPrefixes = ["06", "07", "08", "09", "05"];

  if (!validPrefixes.includes(prefix)) {
    return null; // Invalid Moroccan phone prefix
  }

  return normalized;
}

/**
 * Validate Moroccan phone number
 * Returns true if the phone number is valid and can be normalized
 */
export function isValidPhoneNumber(phone: string): boolean {
  return normalizePhoneNumber(phone) !== null;
}

/**
 * Trim a single string value
 */
export function trimString(value: string): string {
  return typeof value === "string" ? value.trim() : value;
}

/**
 * Comprehensive text normalization
 * - Trim whitespace (leading/trailing)
 * - Reduce multiple internal spaces to single space
 * - Remove non-breaking spaces and other control characters
 */
export function normalizeText(text: string): string {
  if (typeof text !== "string") {
    return text;
  }

  // Trim edges
  let normalized = text.trim();

  // Replace multiple consecutive spaces (including non-breaking spaces U+00A0) with single space
  normalized = normalized.replace(/[\s\u00A0]+/g, " ");

  // Remove any remaining control characters except space and common punctuation
  normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  return normalized;
}
