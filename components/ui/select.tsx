import * as React from "react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "h-11 w-full rounded-2xl border border-input bg-white px-4 text-sm text-foreground shadow-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100/70",
      className
    )}
    {...props}
  >
    {children}
  </select>
));

Select.displayName = "Select";

