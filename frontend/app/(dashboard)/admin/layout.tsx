import { AdminFrame } from "./_components/AdminFrame";
import { AdminGuard } from "@/features/auth/AdminGuard";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <AdminGuard>
      <AdminFrame>{children}</AdminFrame>
    </AdminGuard>
  );
}
