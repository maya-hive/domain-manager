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
import { cn } from "@/lib/utils";

const DEFAULT_SPEC = {
    os: "Linux Debian 13 x64",
    processor: "AMD 2vCPUs",
    memory: "2 GiB",
    storage: "SSD 60 GiB",
    region: "Singapore",
};

type SortKey = "serverName" | "price" | "paymentStatus";
type SortDir = "asc" | "desc";
type PaymentStatus = "Paid" | "Unpaid" | "Overdue";

const PAGE_SIZE = 10;

export const Route = createFileRoute("/_dashboard/hosting")({
    component: HostingPage,
});

function HostingPage() {
    const hostings = useQuery(api.hostings.getHostings) ?? [];
    const addHosting = useMutation(api.hostings.addHosting);
    const updateHosting = useMutation(api.hostings.updateHosting);
    const deleteHosting = useMutation(api.hostings.deleteHosting);

    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState<Id<"hostings"> | null>(null);

    const [formServerName, setFormServerName] = useState("");
    const [formServerIP, setFormServerIP] = useState("");
    const [formPrice, setFormPrice] = useState("");
    const [formPayment, setFormPayment] = useState<PaymentStatus>("Unpaid");
    const [formNote, setFormNote] = useState("");
    const [formSpec, setFormSpec] = useState({ ...DEFAULT_SPEC });

    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState<SortKey>("serverName");
    const [sortDir, setSortDir] = useState<SortDir>("asc");
    const [page, setPage] = useState(0);

    const filtered = hostings.filter((h) => {
        const q = search.toLowerCase();
        return (
            h.serverName.toLowerCase().includes(q) ||
            h.serverIP.toLowerCase().includes(q) ||
            h.paymentStatus.toLowerCase().includes(q) ||
            (h.note ?? "").toLowerCase().includes(q)
        );
    });

    const sorted = [...filtered].sort((a, b) => {
        const dir = sortDir === "asc" ? 1 : -1;
        if (sortKey === "serverName") return a.serverName.localeCompare(b.serverName) * dir;
        if (sortKey === "price") return (a.price - b.price) * dir;
        const order: Record<PaymentStatus, number> = { Paid: 0, Unpaid: 1, Overdue: 2 };
        return (order[a.paymentStatus] - order[b.paymentStatus]) * dir;
    });

    const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const paginated = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

    function toggleSort(key: SortKey) {
        if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        else { setSortKey(key); setSortDir("asc"); }
    }

    function openAdd() {
        setEditId(null);
        setFormServerName("");
        setFormServerIP("");
        setFormPrice("");
        setFormPayment("Unpaid");
        setFormNote("");
        setFormSpec({ ...DEFAULT_SPEC });
        setModalOpen(true);
    }

    function openEdit(id: Id<"hostings">) {
        const h = hostings.find((x) => x._id === id);
        if (!h) return;
        setEditId(id);
        setFormServerName(h.serverName);
        setFormServerIP(h.serverIP);
        setFormPrice(String(h.price));
        setFormPayment(h.paymentStatus);
        setFormNote(h.note ?? "");
        setFormSpec({ ...h.serverSpec });
        setModalOpen(true);
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const data = {
            serverName: formServerName,
            serverIP: formServerIP,
            serverSpec: formSpec,
            price: Number(formPrice),
            paymentStatus: formPayment as PaymentStatus,
            note: formNote || undefined,
        };
        if (editId) {
            await updateHosting({ id: editId, ...data });
        } else {
            await addHosting(data);
        }
        setModalOpen(false);
    }

    async function handleDelete(id: Id<"hostings">) {
        if (!confirm("Delete this hosting package?")) return;
        await deleteHosting({ id });
    }

    const paymentBadge = (status: PaymentStatus) => {
        const styles: Record<PaymentStatus, string> = {
            Paid: "bg-green-100 text-green-700",
            Unpaid: "bg-yellow-100 text-yellow-700",
            Overdue: "bg-red-100 text-red-700",
        };
        return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium", styles[status])}>{status}</span>;
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Hosting</h1>
                    <p className="text-sm text-muted-foreground">Manage server allocations, billing, and specifications.</p>
                </div>
                <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                    <Plus className="h-4 w-4" /> Add Hosting
                </button>
            </div>

            <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                    placeholder="Search by server name, IP, or status..."
                    className="w-full rounded-md border bg-card pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
            </div>

            <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b bg-muted/50">
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("serverName")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Server Name <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Server IP</th>
                            <th className="px-4 py-3 text-left font-medium text-muted-foreground">Spec</th>
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("price")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Price <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-left font-medium">
                                <button onClick={() => toggleSort("paymentStatus")} className="inline-flex items-center gap-1 hover:text-foreground text-muted-foreground">
                                    Payment <ArrowUpDown className="h-3 w-3" />
                                </button>
                            </th>
                            <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 && (
                            <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">No hosting packages found.</td></tr>
                        )}
                        {paginated.map((h) => (
                            <tr key={h._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                                <td className="px-4 py-3 font-medium">{h.serverName}</td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{h.serverIP}</td>
                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                    {h.serverSpec.processor} · {h.serverSpec.memory} · {h.serverSpec.storage}
                                </td>
                                <td className="px-4 py-3">${h.price.toFixed(2)}</td>
                                <td className="px-4 py-3">{paymentBadge(h.paymentStatus)}</td>
                                <td className="px-4 py-3 text-right">
                                    <div className="inline-flex items-center gap-1">
                                        <button onClick={() => openEdit(h._id)} className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                            <Pencil className="h-4 w-4" />
                                        </button>
                                        <button onClick={() => handleDelete(h._id)} className="rounded p-1.5 text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors">
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
                    <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg bg-card p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold">{editId ? "Edit Hosting" : "Add Hosting"}</h2>
                            <button onClick={() => setModalOpen(false)} className="rounded p-1 hover:bg-accent"><X className="h-4 w-4" /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Server Name</label>
                                    <input type="text" required value={formServerName} onChange={(e) => setFormServerName(e.target.value)} placeholder="my-server-01"
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Server IP</label>
                                    <input type="text" required value={formServerIP} onChange={(e) => setFormServerIP(e.target.value)} placeholder="192.168.1.1"
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Price</label>
                                    <input type="number" step="0.01" required value={formPrice} onChange={(e) => setFormPrice(e.target.value)} placeholder="9.99"
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Payment Status</label>
                                    <select value={formPayment} onChange={(e) => setFormPayment(e.target.value as PaymentStatus)}
                                        className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary">
                                        <option value="Paid">Paid</option>
                                        <option value="Unpaid">Unpaid</option>
                                        <option value="Overdue">Overdue</option>
                                    </select>
                                </div>
                            </div>

                            <fieldset className="rounded-md border p-4">
                                <legend className="px-1 text-sm font-medium">Server Spec</legend>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">OS</label>
                                        <input type="text" value={formSpec.os} onChange={(e) => setFormSpec({ ...formSpec, os: e.target.value })}
                                            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">Processor</label>
                                        <input type="text" value={formSpec.processor} onChange={(e) => setFormSpec({ ...formSpec, processor: e.target.value })}
                                            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">Memory</label>
                                        <input type="text" value={formSpec.memory} onChange={(e) => setFormSpec({ ...formSpec, memory: e.target.value })}
                                            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs text-muted-foreground">Storage</label>
                                        <input type="text" value={formSpec.storage} onChange={(e) => setFormSpec({ ...formSpec, storage: e.target.value })}
                                            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="mb-1 block text-xs text-muted-foreground">Region</label>
                                        <input type="text" value={formSpec.region} onChange={(e) => setFormSpec({ ...formSpec, region: e.target.value })}
                                            className="w-full rounded-md border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary" />
                                    </div>
                                </div>
                            </fieldset>

                            <div>
                                <label className="mb-1 block text-sm font-medium">Note (optional)</label>
                                <textarea value={formNote} onChange={(e) => setFormNote(e.target.value)} rows={2} placeholder="Additional notes..."
                                    className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none" />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={() => setModalOpen(false)} className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors">Cancel</button>
                                <button type="submit" className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors">
                                    {editId ? "Save Changes" : "Add Hosting"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
