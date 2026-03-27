import * as React from "react";
import { cn } from "@/lib/utils"; // optional utility, fallback to simple concat if missing

// Simple Badge component (shadcn/ui style)
export const Badge = ({ variant = "default", className = "", children }) => {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors";
  const variantStyles = {
    default: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
    destructive: "bg-destructive/10 text-destructive",
    outline: "border border-input bg-background text-foreground",
  }[variant] || variantStyles["default"];
  return (
    <span className={cn(baseStyles, variantStyles, className)}>{children}</span>
  );
};

Badge.displayName = "Badge";
