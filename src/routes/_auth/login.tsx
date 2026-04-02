import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_auth/login")({
    component: LoginPage,
});

function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password);
            navigate({ to: "/domains" });
        } catch (err) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm">
            <div className="rounded-lg border bg-card p-8 shadow-sm">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-bold">Sign In</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Sign in to Domain Manager
                    </p>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors disabled:opacity-60"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
