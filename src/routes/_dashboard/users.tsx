import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
    UserCog,
    ShieldAlert,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth";

type Role = "Admin" | "Editor";
type SortKey = "name" | "email" | "role";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_dashboard/users")({
    component: UsersPage,
});

function UsersPage() {
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const users = useQuery(api.users.getUsers) ?? [];
    const createUser = useMutation(api.users.createUser);
    const updateUserRole = useMutation(api.users.updateUserRole);
    const deleteUser = useMutation(api.users.deleteUser);

    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<Id<"users"> | null>(null);
    const [formName, setFormName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formRole, setFormRole] = useState<Role>("Editor");

    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(0);

    if (currentUser && currentUser.role !== "Admin") {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <ShieldAlert className="mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="text-xl font-semibold">Access Denied</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Only administrators can access this page.
                </p>
                <button
                    onClick={() => navigate({ to: "/domains" })}
                    className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                    Go to Domains
                </button>
            </div>
        );
    }

    const filtered = users.filter((u) => {
        const q = search.toLowerCase();
        return (
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.role.toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
        if (sortKey === "email") return a.email.localeCompare(b.email) * dir;
        return a.role.localeCompare(b.role) * dir;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    function openAdd() {
        setEditId(null);
        setFormName("");
        setFormEmail("");
        setFormRole("Editor");
        setModalOpen(true);
    }

    function openEdit(id: Id<"users">) {
        const u = users.find((x) => x._id === id);
        if (!u) return;
        setEditId(id);
        setFormName(u.name);
        setFormEmail(u.email);
        setFormRole(u.role);
        setModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (editId) {
            await updateUserRole({ id: editId, role: formRole });
        } else {
            await createUser({
                name: formName,
                email: formEmail,
                role: formRole,
                tokenIdentifier: `manual:${formEmail}`,
            });
        }
        setModalOpen(false);
    }

    async function handleDelete(id: Id<"users">) {
        if (!confirm("Delete this user?")) return;
        await deleteUser({ id });
    }

    const roleBadge = (role: Role) => {
        if (role === "Admin")
            return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700"><ShieldCheck className="h-3 w-3" />Admin</span>;
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"><UserCog className="h-3 w-3" />Editor</span>;
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">System Users</h1>
                    <p className="text-sm text-muted-foreground">Manage internal staff access to the dashboard.</p>
                </div>
                <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Add User
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Search by name, email, or role..."
                    className="w-full rounded-md border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Name <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("email")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Email <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("role")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Role <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No users found.</td></tr>
                        )}
                        {paginated.map((user) => (
                            <tr key={user._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">{user.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                                <td className="px-4 py-3">{roleBadge(user.role)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="inline-flex items-center gap-1">
                                        <button onClick={() => openEdit(user._id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(user._id)} className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                        <span>Page {page + 1} of {totalPages} ({sorted.length} total)</span>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="rounded p-1 hover:bg-accent disabled:opacity-40">
                                <ChevronLeft className="h-4 w-4" />
                            </button>
                            <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="rounded p-1 hover:bg-accent disabled:opacity-40">
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setModalOpen(false)}>
                    <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{editId ? "Edit User Role" : "Add User"}</h2>
                            <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!editId && (
                                <>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Name</label>
                                        <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="John Doe"
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium">Email</label>
                                        <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="john@example.com"
                                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                </>
                            )}
                            <div>
                                <label className="mb-1 block text-sm font-medium">Role</label>
                                <select value={formRole} onChange={(e) => setFormRole(e.target.value as Role)}
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                    <option value="Editor">Editor</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
                                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                                    {editId ? "Save Role" : "Add User"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
