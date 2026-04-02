import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getClients = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("clients").collect();
    },
});

export const addClient = mutation({
    args: {
        name: v.string(),
        emails: v.array(v.string()),
        contactNumbers: v.array(v.string()),
        address: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("clients", args);
    },
});

export const updateClient = mutation({
    args: {
        id: v.id("clients"),
        name: v.optional(v.string()),
        emails: v.optional(v.array(v.string())),
        contactNumbers: v.optional(v.array(v.string())),
        address: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const clean: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) clean[key] = value;
        }
        await ctx.db.patch(id, clean);
    },
});

export const deleteClient = mutation({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
