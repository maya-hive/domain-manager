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
    ExternalLink,
    Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = "domainName" | "expireDate" | "status";
type SortDir = "asc" | "desc";

function getDomainStatus(expireDate: number) {
    const now = Date.now();
    if (expireDate < now) return "expired";
    if (expireDate < now + 30 * 86400000) return "expiring";
    return "active";
}

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_dashboard/domains")({
    component: DomainsPage,
});

function DomainsPage() {
    const domains = useQuery(api.domains.getDomains) ?? [];
    const addDomain = useMutation(api.domains.addDomain);
    const updateDomain = useMutation(api.domains.updateDomain);
    const deleteDomain = useMutation(api.domains.deleteDomain);

    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<Id<"domains"> | null>(null);
    const [formName, setFormName] = useState("");
    const [formExpire, setFormExpire] = useState("");
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("expireDate");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(0);

    const filtered = domains.filter((d) =>
        d.domainName.toLowerCase().includes(search.toLowerCase()),
    );

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "domainName") return a.domainName.localeCompare(b.domainName) * dir;
        if (sortKey === "status") {
            const order = { expired: 0, expiring: 1, active: 2 };
            return (order[getDomainStatus(a.expireDate)] - order[getDomainStatus(b.expireDate)]) * dir;
        }
        return (a.expireDate - b.expireDate) * dir;
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
        setFormExpire("");
        setModalOpen(true);
    }

    function openEdit(id: Id<"domains">) {
        const d = domains.find((x) => x._id === id);
        if (!d) return;
        setEditId(id);
        setFormName(d.domainName);
        setFormExpire(d.expireDate ? new Date(d.expireDate).toISOString().split("T")[0] : "");
        setModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const expireDate = new Date(formExpire).getTime();
        if (editId) {
            await updateDomain({ id: editId, domainName: formName, expireDate });
        } else {
            await addDomain({ domainName: formName, expireDate });
        }
        setModalOpen(false);
    }

    async function handleDelete(id: Id<"domains">) {
        if (!confirm("Delete this domain?")) return;
        await deleteDomain({ id });
    }

    const statusBadge = (expireDate: number) => {
        if (!expireDate) return <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700">N/A</span>;
        const s = getDomainStatus(expireDate);
        if (s === "expired")
            return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">Expired</span>;
        if (s === "expiring")
            return <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">Expiring Soon</span>;
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">Active</span>;
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Domains</h1>
                    <p className="text-sm text-muted-foreground">Manage domain registrations and expiration timelines.</p>
                </div>
                <button
                    onClick={openAdd}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
                >
                    <Plus className="h-4 w-4" /> Add Domain
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Search domains..."
                    className="w-full rounded-md border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("domainName")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Domain Name <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("expireDate")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Expire Date <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("status")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Status <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 && (
                            <tr><td colSpan={4} className="px-4 py-12 text-center text-muted-foreground">No domains found.</td></tr>
                        )}
                        {paginated.map((domain) => (
                            <tr key={domain._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">
                                    {domain.domainName}
                                    <a
                                        href={`https://${domain.domainName}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="ml-1.5 inline-flex align-middle text-muted-foreground hover:text-primary transition-colors"
                                        title={`Open ${domain.domainName}`}
                                    >
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground">{domain.expireDate ? new Date(domain.expireDate).toLocaleDateString() : "N/A"}</td>
                                <td className="px-4 py-3">{statusBadge(domain.expireDate)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="inline-flex items-center gap-1">
                                        <button onClick={() => openEdit(domain._id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(domain._id)} className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
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
                            <h2 className="text-lg font-semibold">{editId ? "Edit Domain" : "Add Domain"}</h2>
                            <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-accent">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Domain Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formName}
                                    onChange={(e) => setFormName(e.target.value)}
                                    placeholder="example.com"
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Expire Date</label>
                                <input
                                    type="date"
                                    value={formExpire}
                                    onChange={(e) => setFormExpire(e.target.value)}
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                                    {editId ? "Save Changes" : "Add Domain"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
