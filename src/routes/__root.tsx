/// <reference types="vite/client" />
import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import {
    Outlet,
    createRootRouteWithContext,
    HeadContent,
    Scripts,
} from "@tanstack/react-router";
import { AuthProvider } from "@/auth";
import appCss from "@/styles/globals.css?url";

interface RouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
    head: () => ({
        meta: [
            { charSet: "utf-8" },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            { title: "Domain Manager" },
        ],
        links: [{ rel: "stylesheet", href: appCss }],
    }),
    component: RootComponent,
});

function RootComponent() {
    return (
        <RootDocument>
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        </RootDocument>
    );
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className="antialiased">
                {children}
                <Scripts />
            </body>
        </html>
    );
}
