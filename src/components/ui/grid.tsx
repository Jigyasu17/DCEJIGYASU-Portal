import { cn } from "@/lib/utils";

export const Grid = ({ className, children }) => (
  <div className={cn("grid", className)}>{children}</div>
);
