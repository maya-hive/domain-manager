import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const getDomains = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("domains").withIndex("by_expireDate").collect();
    },
});

export const addDomain = mutation({
    args: {
        domainName: v.string(),
        expireDate: v.number(),
        clientId: v.optional(v.id("clients")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("domains", {
            domainName: args.domainName,
            expireDate: args.expireDate,
            clientId: args.clientId,
        });
    },
});

export const updateDomain = mutation({
    args: {
        id: v.id("domains"),
        domainName: v.optional(v.string()),
        expireDate: v.optional(v.number()),
        clientId: v.optional(v.id("clients")),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const clean: Record<string, unknown> = {};
        if (updates.domainName !== undefined) clean.domainName = updates.domainName;
        if (updates.expireDate !== undefined) clean.expireDate = updates.expireDate;
        if (updates.clientId !== undefined) clean.clientId = updates.clientId;
        await ctx.db.patch(id, clean);
    },
});

export const deleteDomain = mutation({
    args: { id: v.id("domains") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const updateExpireByName = internalMutation({
    args: {
        domainName: v.string(),
        expireDate: v.number(),
    },
    handler: async (ctx, args) => {
        const domain = await ctx.db
            .query("domains")
            .withIndex("by_domainName", (q) => q.eq("domainName", args.domainName))
            .first();
        if (domain) {
            await ctx.db.patch(domain._id, { expireDate: args.expireDate });
        } else {
            await ctx.db.insert("domains", {
                domainName: args.domainName,
                expireDate: args.expireDate,
            });
        }
    },
});
