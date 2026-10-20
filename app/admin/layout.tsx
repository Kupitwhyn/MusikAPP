import { AdminShell } from "@/components/admin-shell"
import { getSessionUser } from "@/lib/session"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSessionUser()
  return <AdminShell adminName={user?.name ?? "Super Admin"}>{children}</AdminShell>
}
