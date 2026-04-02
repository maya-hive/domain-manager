"use node";

import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { createHash, randomBytes } from "crypto";

function hashPassword(password: string): string {
    const salt = randomBytes(16).toString("hex");
    const hash = createHash("sha256")
        .update(salt + password)
        .digest("hex");
    return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
    const [salt, hash] = stored.split(":");
    const computed = createHash("sha256")
        .update(salt + password)
        .digest("hex");
    return hash === computed;
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const register = action({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        if (args.password.length < 6) {
            throw new Error("Password must be at least 6 characters");
        }

        const passwordHash = hashPassword(args.password);
        const userId = await ctx.runMutation(
            internal.authHelpers.createUserWithPassword,
            {
                name: args.name,
                email: args.email,
                passwordHash,
                role: "Editor" as const,
            },
        );

        const token = randomBytes(32).toString("hex");
        await ctx.runMutation(internal.authHelpers.createSession, {
            userId,
            token,
            expiresAt: Date.now() + SESSION_DURATION_MS,
        });

        return { token };
    },
});

export const login = action({
    args: {
        email: v.string(),
        password: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.runQuery(internal.authHelpers.getUserByEmail, {
            email: args.email,
        });

        if (!user || !user.passwordHash) {
            throw new Error("Invalid email or password");
        }

        if (!verifyPassword(args.password, user.passwordHash)) {
            throw new Error("Invalid email or password");
        }

        const token = randomBytes(32).toString("hex");
        await ctx.runMutation(internal.authHelpers.createSession, {
            userId: user._id,
            token,
            expiresAt: Date.now() + SESSION_DURATION_MS,
        });

        return { token };
    },
});
