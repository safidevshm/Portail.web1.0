import { useState, useCallback } from "react";
import { trimString } from "@shared/utils";

interface UseTrimmedFormDataOptions {
  fieldsToTrim?: string[];
  fieldsToNormalize?: string[];
}

export function useTrimmedFormData<T extends Record<string, any>>(
  initialData: T,
  options?: UseTrimmedFormDataOptions
) {
  const [formData, setFormData] = useState<T>(initialData);

  const fieldsToTrim = options?.fieldsToTrim || [];
  const fieldsToNormalize = options?.fieldsToNormalize || [];

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => {
        const updated = { ...prev };
        let processedValue = value;

        // Auto-trim if field is in trim list (or trim all text fields by default)
        if (
          fieldsToTrim.length === 0 &&
          typeof value === "string"
        ) {
          // Default: trim all string fields
          processedValue = value;
        } else if (fieldsToTrim.includes(name) && typeof value === "string") {
          processedValue = value;
        }

        (updated as any)[name] = processedValue;
        return updated;
      });
    },
    [fieldsToTrim]
  );

  const getTrimmedData = useCallback((data: T = formData): T => {
    const trimmed = { ...data } as Record<string, any>;

    for (const key in trimmed) {
      const value = trimmed[key];

      // Trim text fields
      if (typeof value === "string") {
        trimmed[key] = value.trim();
      }
    }

    return trimmed as T;
  }, [formData]);

  return {
    formData,
    setFormData,
    handleChange,
    getTrimmedData,
  };
}
