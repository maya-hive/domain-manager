import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";

type User = {
    _id: string;
    name: string;
    email: string;
    role: "Admin" | "Editor";
};

type AuthContextType = {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = "dm_session_token";

export function AuthProvider({ children }: { children: ReactNode }) {
    const [token, setToken] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setToken(localStorage.getItem(TOKEN_KEY));
        setMounted(true);
    }, []);

    const sessionUser = useQuery(
        api.authHelpers.validateSession,
        token ? { token } : "skip",
    );

    const loginAction = useAction(api.authActions.login);
    const registerAction = useAction(api.authActions.register);
    const logoutMutation = useMutation(api.authHelpers.logout);

    const login = useCallback(
        async (email: string, password: string) => {
            const result = await loginAction({ email, password });
            localStorage.setItem(TOKEN_KEY, result.token);
            setToken(result.token);
        },
        [loginAction],
    );

    const register = useCallback(
        async (name: string, email: string, password: string) => {
            const result = await registerAction({ name, email, password });
            localStorage.setItem(TOKEN_KEY, result.token);
            setToken(result.token);
        },
        [registerAction],
    );

    const logout = useCallback(async () => {
        if (token) {
            await logoutMutation({ token });
        }
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
    }, [token, logoutMutation]);

    const isLoading = !mounted || (token !== null && sessionUser === undefined);

    const user: User | null =
        sessionUser && sessionUser._id
            ? (sessionUser as User)
            : null;

    useEffect(() => {
        if (mounted && token && sessionUser === null) {
            localStorage.removeItem(TOKEN_KEY);
            setToken(null);
        }
    }, [mounted, token, sessionUser]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}
