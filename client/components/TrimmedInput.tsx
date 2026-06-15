import React from "react";
import { cn } from "@/lib/utils";

interface TrimmedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onTrimmedChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  shouldTrim?: boolean;
}

export const TrimmedInput = React.forwardRef<HTMLInputElement, TrimmedInputProps>(
  ({ onTrimmedChange, shouldTrim = true, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (shouldTrim && props.type !== "email" && props.type !== "number") {
        // Show trimmed value in real-time for text inputs
        // But preserve cursor position by not actually modifying the input value here
        // The parent component should handle the trimming in its state
      }

      if (onTrimmedChange) {
        onTrimmedChange(e);
      }
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <input
        ref={ref}
        onChange={handleChange}
        {...props}
        className={cn("rounded px-4 py-2 border border-gray-300", props.className)}
      />
    );
  }
);

TrimmedInput.displayName = "TrimmedInput";
