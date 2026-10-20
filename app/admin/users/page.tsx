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
    <div className="mx-auto max-w-[1500px]">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">Platform accounts</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight">Users</h1>
        <p className="mt-2 text-sm text-muted-foreground">Review account roles and access to Reverb.</p>
      </div>
      <form className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row">
        <input name="query" defaultValue={query} placeholder="Search name or email" className="min-h-10 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
        <select name="role" defaultValue={role} className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"><option value="">All roles</option><option value="SUPER_ADMIN">Super admins</option><option value="MUSICIAN">Musicians</option><option value="AUDIENCE">Audiences</option></select>
        <button type="submit" className="min-h-10 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">Apply filters</button>
      </form>
      <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr><th className="px-5 py-3.5 font-medium">Name</th><th className="px-5 py-3.5 font-medium">Email</th><th className="px-5 py-3.5 font-medium">Role</th><th className="px-5 py-3.5 font-medium">Status</th><th className="px-5 py-3.5 font-medium">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((account) => (
                <tr key={account.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-5 py-4 font-medium">{account.name}</td>
                  <td className="px-5 py-4 text-muted-foreground">{account.email}</td>
                  <td className="px-5 py-4"><UserRoleForm userId={account.id} initialRole={account.role} /></td>
                  <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${account.banned ? "bg-rose-400/15 text-rose-300" : "bg-emerald-400/15 text-emerald-300"}`}>{account.banned ? "Suspended" : "Active"}</span></td>
                  <td className="px-5 py-4">{account.role === "SUPER_ADMIN" && account.banned === false ? <span className="text-xs text-muted-foreground">Protected</span> : <UserBanForm userId={account.id} banned={account.banned} />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 ? <p className="px-5 py-10 text-center text-sm text-muted-foreground">No users match the current filters.</p> : null}
      </div>
    </div>
  )
}
