import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";

const http = httpRouter();

function verifyApiKey(req: Request): boolean {
    const apiKey = req.headers.get("x-api-key");
    return apiKey === process.env.N8N_API_KEY;
}

http.route({
    path: "/api/domains",
    method: "GET",
    handler: httpAction(async (ctx, req) => {
        if (!verifyApiKey(req)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const domains = await ctx.runQuery(api.domains.getDomains);

        return new Response(JSON.stringify(domains), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

http.route({
    path: "/api/update-domain-expiry",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        if (!verifyApiKey(req)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = await req.json();
        const { domainName, expireDate } = body as {
            domainName: string;
            expireDate: number;
        };

        if (!domainName || typeof expireDate !== "number") {
            return new Response(
                JSON.stringify({ error: "Missing required fields: domainName (string), expireDate (number)" }),
                { status: 400, headers: { "Content-Type": "application/json" } },
            );
        }

        try {
            await ctx.runMutation(internal.domains.updateExpireByName, {
                domainName,
                expireDate,
            });
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { "Content-Type": "application/json" },
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Unknown error";
            return new Response(JSON.stringify({ error: message }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

export default http;
