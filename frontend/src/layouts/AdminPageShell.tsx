import type { ReactNode } from "react";
import { AdminLayout } from "./AdminLayout";

export function AdminPageShell({
  embedded = false,
  children,
}: {
  embedded?: boolean;
  children: ReactNode;
}) {
  return embedded ? <>{children}</> : <AdminLayout>{children}</AdminLayout>;
}
