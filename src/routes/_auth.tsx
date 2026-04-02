import { useEffect } from "react";
import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_auth")({
    component: AuthLayout,
});

function AuthLayout() {
    const { user, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && user) {
            navigate({ to: "/domains" });
        }
    }, [isLoading, user, navigate]);

    if (isLoading || user) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <Outlet />
        </div>
    );
}
