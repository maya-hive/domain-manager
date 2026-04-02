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

        const payload = domains.map((d) => ({
            _id: d._id,
            domainName: d.domainName,
            expireDate: d.expireDate,
        }));

        return new Response(JSON.stringify(payload), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    }),
});

http.route({
    path: "/api/domains/update-expire",
    method: "POST",
    handler: httpAction(async (ctx, req) => {
        if (!verifyApiKey(req)) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" },
            });
        }

        let domainName: string | undefined;
        let expireDate: number | undefined;

        const contentType = req.headers.get("content-type") ?? "";

        if (contentType.includes("multipart/form-data") || contentType.includes("application/x-www-form-urlencoded")) {
            const form = await req.formData();
            domainName = form.get("domainName")?.toString();
            const raw = form.get("expireDate")?.toString();
            expireDate = raw ? Number(raw) : undefined;
        } else {
            try {
                const parsed = await req.json();
                domainName = parsed.domainName;
                expireDate = typeof parsed.expireDate === "number"
                    ? parsed.expireDate
                    : Number(parsed.expireDate);
            } catch {
                return new Response(
                    JSON.stringify({ error: "Invalid request body" }),
                    { status: 400, headers: { "Content-Type": "application/json" } },
                );
            }
        }

        if (expireDate !== undefined && isNaN(expireDate)) {
            expireDate = undefined;
        }

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
                status: 500,
                headers: { "Content-Type": "application/json" },
            });
        }
    }),
});

export default http;
