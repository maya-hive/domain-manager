import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, XCircle, Globe, ArrowRight } from "lucide-react";

function getDomainStatus(expireDate: number) {
    const now = Date.now();
    if (expireDate < now) return "expired";
    if (expireDate < now + 30 * 86400000) return "expiring";
    return "active";
}

export const Route = createFileRoute("/_dashboard/")({
    component: DashboardPage,
});

function DashboardPage() {
    const domains = useQuery(api.domains.getDomains) ?? [];

    const expired = domains.filter((d) => getDomainStatus(d.expireDate) === "expired");
    const expiring = domains.filter((d) => getDomainStatus(d.expireDate) === "expiring");

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">Overview of your domain portfolio.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100">
                            <XCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Expired Domains</p>
                            <p className="text-3xl font-bold text-red-600">{expired.length}</p>
                        </div>
                    </div>
                    {expired.length > 0 && (
                        <div className="border-t px-6 py-3">
                            <ul className="space-y-1">
                                {expired.slice(0, 5).map((d) => (
                                    <li key={d._id} className="flex items-center justify-between text-sm">
                                        <span className="truncate font-medium">{d.domainName}</span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {new Date(d.expireDate).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                                {expired.length > 5 && (
                                    <li className="text-xs text-muted-foreground">
                                        +{expired.length - 5} more
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="rounded-lg border bg-card shadow-sm">
                    <div className="flex items-center gap-4 p-6">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                            <AlertTriangle className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Expiring Soon</p>
                            <p className="text-3xl font-bold text-yellow-600">{expiring.length}</p>
                        </div>
                    </div>
                    {expiring.length > 0 && (
                        <div className="border-t px-6 py-3">
                            <ul className="space-y-1">
                                {expiring.slice(0, 5).map((d) => (
                                    <li key={d._id} className="flex items-center justify-between text-sm">
                                        <span className="truncate font-medium">{d.domainName}</span>
                                        <span className="shrink-0 text-xs text-muted-foreground">
                                            {new Date(d.expireDate).toLocaleDateString()}
                                        </span>
                                    </li>
                                ))}
                                {expiring.length > 5 && (
                                    <li className="text-xs text-muted-foreground">
                                        +{expiring.length - 5} more
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-6">
                <Link
                    to="/domains"
                    className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                    <Globe className="h-4 w-4" />
                    View all domains
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    );
}
