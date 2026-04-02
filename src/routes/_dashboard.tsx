import { useEffect } from "react";
import {
    createFileRoute,
    Outlet,
    Link,
    useNavigate,
    useLocation,
} from "@tanstack/react-router";
import { Globe, Server, Users, Building2, LogOut, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/auth";

const allNavItems = [
    { to: "/domains" as const, label: "Domains", icon: Globe, adminOnly: false },
    { to: "/hosting" as const, label: "Hosting", icon: Server, adminOnly: false },
    { to: "/clients" as const, label: "Clients", icon: Building2, adminOnly: false },
    { to: "/users" as const, label: "Users", icon: Users, adminOnly: true },
];

export const Route = createFileRoute("/_dashboard")({
    component: DashboardLayout,
});

function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, isLoading, logout } = useAuth();

    useEffect(() => {
        if (!isLoading && !user) {
            navigate({ to: "/login" });
        }
    }, [isLoading, user, navigate]);

    if (isLoading || !user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        );
    }

    const navItems = allNavItems.filter(
        (item) => !item.adminOnly || user.role === "Admin",
    );

    async function handleLogout() {
        await logout();
        navigate({ to: "/login" });
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="sticky top-0 z-50 border-b bg-card shadow-sm">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
                    <div className="flex items-center gap-8">
                        <Link
                            to="/domains"
                            className="text-lg font-bold tracking-tight"
                        >
                            Domain Manager
                        </Link>
                        <nav className="flex items-center gap-1">
                            {navItems.map(({ to, label, icon: Icon }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={cn(
                                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        location.pathname === to
                                            ? "bg-accent text-accent-foreground"
                                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {label}
                                </Link>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-medium leading-none">
                                {user.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {user.role}
                            </p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                            title="Sign out"
                        >
                            <LogOut className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-6 py-8">
                <Outlet />
            </main>
        </div>
    );
}
