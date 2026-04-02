import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUsers = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("users").collect();
    },
});

export const createUser = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        role: v.union(v.literal("Admin"), v.literal("Editor")),
        tokenIdentifier: v.string(),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db
            .query("users")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .unique();
        if (existing) {
            throw new Error("A user with this email already exists");
        }
        return await ctx.db.insert("users", args);
    },
});

export const updateUserRole = mutation({
    args: {
        id: v.id("users"),
        role: v.union(v.literal("Admin"), v.literal("Editor")),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { role: args.role });
    },
});

export const deleteUser = mutation({
    args: { id: v.id("users") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
