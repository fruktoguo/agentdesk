import { cloneElement, forwardRef, isValidElement } from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "primary"
  | "yellow"
  | "blue"
  | "outline"
  | "ghost"
  | "danger"
  | "success";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white",
  yellow: "bg-surface text-ink",
  blue: "bg-sky text-white",
  outline: "bg-bg text-ink",
  ghost: "bg-transparent text-ink border-transparent shadow-none",
  danger: "bg-ink text-white",
  success: "bg-grass text-ink",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base",
  icon: "size-10 p-0",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, children, ...props }, ref) => {
    const cls = cn(
      "inline-flex items-center justify-center gap-2 rounded-btn border-2 border-ink font-bold uppercase tracking-tight shadow-hard pressable select-none",
      variants[variant],
      sizes[size],
      className,
    );

    // asChild：把按钮样式合并到子元素（如 <Link>）
    if (asChild && isValidElement(children)) {
      const child = children as React.ReactElement<{ className?: string }>;
      return cloneElement(child, { className: cn(cls, child.props.className) });
    }

    return (
      <button ref={ref} className={cls} {...props}>
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
