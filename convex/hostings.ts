import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const serverSpecValidator = v.object({
    os: v.string(),
    processor: v.string(),
    memory: v.string(),
    storage: v.string(),
    region: v.string(),
});

export const getHostings = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("hostings").collect();
    },
});

export const addHosting = mutation({
    args: {
        serverName: v.string(),
        serverIP: v.string(),
        serverSpec: serverSpecValidator,
        price: v.number(),
        paymentStatus: v.union(
            v.literal("Paid"),
            v.literal("Unpaid"),
            v.literal("Overdue"),
        ),
        note: v.optional(v.string()),
        clientId: v.optional(v.id("clients")),
        domainId: v.optional(v.id("domains")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("hostings", args);
    },
});

export const updateHosting = mutation({
    args: {
        id: v.id("hostings"),
        serverName: v.optional(v.string()),
        serverIP: v.optional(v.string()),
        serverSpec: v.optional(serverSpecValidator),
        price: v.optional(v.number()),
        paymentStatus: v.optional(
            v.union(
                v.literal("Paid"),
                v.literal("Unpaid"),
                v.literal("Overdue"),
            ),
        ),
        note: v.optional(v.string()),
        clientId: v.optional(v.id("clients")),
        domainId: v.optional(v.id("domains")),
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

export const deleteHosting = mutation({
    args: { id: v.id("hostings") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});
