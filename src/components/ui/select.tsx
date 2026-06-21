import { forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/**
 * 原生 <select> 的孟菲斯包装：
 * - 复刻 Input 的 focus 动效（位移 + 硬投影增强）
 * - appearance-none + 自定义下拉箭头，统一风格
 * - 自带 focus-visible 轮廓（来自全局）
 */
export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "w-full appearance-none rounded-input border-2 border-ink bg-bg px-4 py-2.5 pr-10 text-sm font-bold shadow-hard-sm transition",
        "focus:-translate-x-px focus:-translate-y-px focus:shadow-hard",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <Icon
      icon={ChevronDown}
      size={16}
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
    />
  </div>
));
Select.displayName = "Select";
