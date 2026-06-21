import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full rounded-input border-2 border-ink bg-bg px-4 py-2.5 text-sm font-semibold shadow-hard-sm transition placeholder:font-medium placeholder:text-muted/50",
      "focus:-translate-x-px focus:-translate-y-px focus:shadow-hard",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-input border-2 border-ink bg-bg px-4 py-2.5 text-sm font-medium shadow-hard-sm transition placeholder:text-muted/50",
      "focus:-translate-x-px focus:-translate-y-px focus:shadow-hard",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-bold uppercase tracking-wide",
        className,
      )}
      {...props}
    />
  );
}

/** 字段级错误：role=alert 让屏幕阅读器即时播报 */
export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-bold uppercase text-accent">
      {children}
    </p>
  );
}
