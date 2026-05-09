import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-border px-3 py-1 text-sm bg-input-background placeholder:text-muted-foreground transition-colors outline-none",
        "focus-visible:border-forest-green focus-visible:ring-2 focus-visible:ring-forest-green/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
