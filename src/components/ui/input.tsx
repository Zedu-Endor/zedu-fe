"use client";

import * as React from "react";

import { cn } from "~/lib/utils";
import { Label } from "~/components/ui/label";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export interface FloatingLabelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const FloatingLabelInput = React.forwardRef<
  HTMLInputElement,
  FloatingLabelInputProps
>(
  (
    { className, label, error, icon, type, id, defaultValue, value, ...props },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const isError = !!error;
    const errorId = isError ? `${inputId}-error` : undefined;
    const initialValue = value ?? defaultValue ?? "";
    const [isFocused, setIsFocused] = React.useState(false);
    const [hasValue, setHasValue] = React.useState(!!initialValue);
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value);
      props.onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    // Sync hasValue when value prop changes externally
    React.useEffect(() => {
      const val = value ?? defaultValue ?? "";
      setHasValue(!!val);
    }, [value, defaultValue]);

    // Detect browser autofill on mount (browsers set value asynchronously)
    React.useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const checkAutofill = () => {
        if (input.value && !hasValue) {
          setHasValue(true);
        }
      };

      // Check immediately and then poll for a short window
      checkAutofill();
      const interval = setInterval(checkAutofill, 100);
      const timeout = setTimeout(() => clearInterval(interval), 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }, [hasValue]);

    const isFloating = isFocused || hasValue;

    return (
      <div className="relative w-full">
        <input
          ref={(el) => {
            inputRef.current = el;
            if (ref) {
              if (typeof ref === "function") ref(el);
              else ref.current = el;
            }
          }}
          id={inputId}
          type={type}
          value={value}
          defaultValue={defaultValue}
          {...props}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder=" "
          className={cn(
            "peer flex h-10 w-full rounded-md border border-[#D0D0FD] bg-background px-4 py-2 text-[14px] text-[#667085] placeholder:text-transparent focus:outline-none focus:ring-1 focus:ring-[#7141F8] focus:border-[#7141F8] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150 [-webkit-text-fill-color:#667085] [transition:background-color_9999s,color_9999s]",
            isError &&
              "border-[#F81404] focus:ring-[#F81404] focus:border-[#F81404]",
            icon && "pr-10",
            className
          )}
          aria-invalid={isError ? true : props["aria-invalid"]}
          aria-errormessage={isError ? errorId : props["aria-errormessage"]}
        />
        <Label
          htmlFor={inputId}
          className={cn(
            "absolute left-3 pointer-events-none transition-all duration-150 ease-out",
            isFloating
              ? "top-[-8px] -translate-y-0 text-[11px] text-[#7141F8]"
              : "top-1/2 -translate-y-1/2 text-[14px] text-[#667085]",
            isError && "text-[#F81404]",
            className
          )}
        >
          {label}
        </Label>
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#667085] pointer-events-none">
            {icon}
          </div>
        )}
        {error && (
          <p
            id={errorId}
            className="mt-1.5 text-[12px] text-[#F81404]"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
FloatingLabelInput.displayName = "FloatingLabelInput";

export { Input, FloatingLabelInput };
