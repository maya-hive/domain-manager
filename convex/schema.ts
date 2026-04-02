import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    clients: defineTable({
        name: v.string(),
        emails: v.array(v.string()),
        contactNumbers: v.array(v.string()),
        address: v.optional(v.string()),
    }),

    domains: defineTable({
        domainName: v.string(),
        expireDate: v.number(),
        clientId: v.optional(v.id("clients")),
    })
        .index("by_expireDate", ["expireDate"])
        .index("by_domainName", ["domainName"]),

    hostings: defineTable({
        serverName: v.string(),
        serverIP: v.string(),
        serverSpec: v.object({
            os: v.string(),
            processor: v.string(),
            memory: v.string(),
            storage: v.string(),
            region: v.string(),
        }),
        price: v.number(),
        paymentStatus: v.union(
            v.literal("Paid"),
            v.literal("Unpaid"),
            v.literal("Overdue"),
        ),
        note: v.optional(v.string()),
        clientId: v.optional(v.id("clients")),
        domainId: v.optional(v.id("domains")),
    }).index("by_paymentStatus", ["paymentStatus"]),

    users: defineTable({
        name: v.string(),
        email: v.string(),
        passwordHash: v.optional(v.string()),
        role: v.union(v.literal("Admin"), v.literal("Editor")),
        tokenIdentifier: v.string(),
    })
        .index("by_token", ["tokenIdentifier"])
        .index("by_email", ["email"]),

    sessions: defineTable({
        userId: v.id("users"),
        token: v.string(),
        expiresAt: v.number(),
    }).index("by_token", ["token"]),
});