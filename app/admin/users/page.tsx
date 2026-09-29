import Link from "next/link"
import { getAllUsers } from "@/app/actions/admin"
import { requireRole } from "@/lib/session"
import { UserRoleForm } from "@/components/user-role-form"
import { UserBanForm } from "@/components/user-ban-form"

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ query?: string; role?: string }> }) {
  await requireRole(["SUPER_ADMIN"])
  const params = await searchParams
  const query = params.query ?? ""
  const role = params.role ?? ""
  const users = await getAllUsers(query, role)

  return (
    <main className="min-h-svh bg-background text-foreground">
      <header className="border-b border-border"><div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5"><Link href="/admin" className="font-serif text-2xl font-semibold tracking-tight">Reverb Admin</Link><nav className="flex items-center gap-3 text-sm text-muted-foreground"><Link href="/admin/works" className="hover:text-foreground">Works</Link><Link href="/admin/genres" className="hover:text-foreground">Genres</Link><Link href="/admin/reports" className="hover:text-foreground">Reports</Link></nav></div></header>
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-serif text-3xl font-semibold">Users</h1>
        <form className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row">
          <input name="query" defaultValue={query} placeholder="Search name or email" className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select name="role" defaultValue={role} className="rounded-md border border-border bg-background px-3 py-2 text-sm"><option value="">All roles</option><option value="SUPER_ADMIN">Super admins</option><option value="MUSICIAN">Musicians</option><option value="AUDIENCE">Audiences</option></select>
          <button type="submit" className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background">Filter</button>
        </form>
        <div className="mt-6 overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-card"><tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Actions</th></tr></thead><tbody>
          {users.map((account) => <tr key={account.id} className="border-t border-border"><td className="px-4 py-3">{account.name}</td><td className="px-4 py-3 text-muted-foreground">{account.email}</td><td className="px-4 py-3"><UserRoleForm userId={account.id} initialRole={account.role} /></td><td className="px-4 py-3">{account.banned ? "Banned" : "Active"}</td><td className="px-4 py-3">{account.role === "SUPER_ADMIN" && account.banned === false ? <span className="text-xs text-muted-foreground">Protected</span> : <UserBanForm userId={account.id} banned={account.banned} />}</td></tr>)}
        </tbody></table></div>
        {users.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No users match the current filters.</p>}
      </div>
    </main>
  )
}
