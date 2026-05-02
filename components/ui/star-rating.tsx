"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md"
}: {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        const active = starValue <= value;

        if (readOnly || !onChange) {
          return <Star key={starValue} className={cn(starSize, active ? "fill-amber-400 text-amber-400" : "text-slate-300")} />;
        }

        return (
          <button
            key={starValue}
            type="button"
            className="rounded-full p-0.5 transition hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
            onClick={() => onChange(starValue)}
          >
            <Star className={cn(starSize, active ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          </button>
        );
      })}
    </div>
  );
}