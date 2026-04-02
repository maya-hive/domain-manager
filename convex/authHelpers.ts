import { query, mutation, internalQuery, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserByEmail = internalQuery({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();
    },
});

export const createUserWithPassword = internalMutation({
    args: {
        name: v.string(),
        email: v.string(),
        passwordHash: v.string(),
        role: v.union(v.literal("Admin"), v.literal("Editor")),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();
        if (existing) {
            throw new Error("A user with this email already exists");
        }
        return await ctx.db.insert("users", {
            name: args.name,
            email: args.email,
            passwordHash: args.passwordHash,
            role: args.role,
            tokenIdentifier: `password:${args.email}`,
        });
    },
});

export const createSession = internalMutation({
    args: {
        userId: v.id("users"),
        token: v.string(),
        expiresAt: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("sessions", args);
    },
});

export const validateSession = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();
        if (!session || session.expiresAt < Date.now()) {
            return null;
        }
        const user = await ctx.db.get(session.userId);
        if (!user) return null;
        return {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    },
});

export const logout = mutation({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const session = await ctx.db
            .query("sessions")
            .withIndex("by_token", (q) => q.eq("token", args.token))
            .unique();
        if (session) {
            await ctx.db.delete(session._id);
        }
    },
});
