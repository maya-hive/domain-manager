import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight,
    Search,
} from "lucide-react";

type SortKey = "name" | "emails";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_dashboard/clients")({
    component: ClientsPage,
});

function ClientsPage() {
    const clients = useQuery(api.clients.getClients) ?? [];
    const addClient = useMutation(api.clients.addClient);
    const updateClient = useMutation(api.clients.updateClient);
    const deleteClient = useMutation(api.clients.deleteClient);

    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<Id<"clients"> | null>(null);
    const [formName, setFormName] = useState("");
    const [formEmails, setFormEmails] = useState("");
    const [formPhones, setFormPhones] = useState("");
    const [formAddress, setFormAddress] = useState("");

    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("name");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(0);

    const filtered = clients.filter((c) => {
        const q = search.toLowerCase();
        return (
            c.name.toLowerCase().includes(q) ||
            c.emails.some((e) => e.toLowerCase().includes(q)) ||
            c.contactNumbers.some((n) => n.includes(q)) ||
            (c.address ?? "").toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "name") return a.name.localeCompare(b.name) * dir;
        return (a.emails[0] ?? "").localeCompare(b.emails[0] ?? "") * dir;
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
        setFormEmails("");
        setFormPhones("");
        setFormAddress("");
        setModalOpen(true);
    }

    function openEdit(id: Id<"clients">) {
        const c = clients.find((x) => x._id === id);
        if (!c) return;
        setEditId(id);
        setFormName(c.name);
        setFormEmails(c.emails.join(", "));
        setFormPhones(c.contactNumbers.join(", "));
        setFormAddress(c.address ?? "");
        setModalOpen(true);
    }

    function parseList(input: string): string[] {
        return input.split(",").map((s) => s.trim()).filter(Boolean);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const data = {
            name: formName,
            emails: parseList(formEmails),
            contactNumbers: parseList(formPhones),
            address: formAddress || undefined,
        };
        if (editId) {
            await updateClient({ id: editId, ...data });
        } else {
            await addClient(data);
        }
        setModalOpen(false);
    }

    async function handleDelete(id: Id<"clients">) {
        if (!confirm("Delete this client?")) return;
        await deleteClient({ id });
    }

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Clients</h1>
                    <p className="text-sm text-muted-foreground">Manage customer profiles linked to domains and hostings.</p>
                </div>
                <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Add Client
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Search by name, email, or contact..."
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
                                <button onClick={() => toggleSort("emails")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Email(s) <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Contact(s)</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Address</th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 && (
                            <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No clients found.</td></tr>
                        )}
                        {paginated.map((c) => (
                            <tr key={c._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">{c.name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.emails.join(", ")}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.contactNumbers.join(", ")}</td>
                                <td className="px-4 py-3 text-muted-foreground">{c.address || "\u2014"}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="inline-flex items-center gap-1">
                                        <button onClick={() => openEdit(c._id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(c._id)} className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
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
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{editId ? "Edit Client" : "Add Client"}</h2>
                            <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Name</label>
                                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="Acme Corp"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Email(s)</label>
                                <input type="text" required value={formEmails} onChange={(e) => setFormEmails(e.target.value)} placeholder="one@email.com, two@email.com"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                <p className="mt-1 text-xs text-muted-foreground">Comma-separated for multiple emails.</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Contact Number(s)</label>
                                <input type="text" required value={formPhones} onChange={(e) => setFormPhones(e.target.value)} placeholder="+1234567890, +0987654321"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                <p className="mt-1 text-xs text-muted-foreground">Comma-separated for multiple numbers.</p>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Address (optional)</label>
                                <textarea value={formAddress} onChange={(e) => setFormAddress(e.target.value)} rows={2} placeholder="123 Main Street..."
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
                                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                                    {editId ? "Save Changes" : "Add Client"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
