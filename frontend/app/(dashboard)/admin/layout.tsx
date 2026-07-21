import { AdminFrame } from "./_components/AdminFrame";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AdminFrame>{children}</AdminFrame>;
}
