import { Hono } from "hono";
import { CSSService, TailwindConfig } from "../types";
import { z } from "zod";

// Default Tailwind config
const defaultTailwindConfig: TailwindConfig = {
  content: [],
  theme: {},
  plugins: [],
  safelist: ['text-red-500', 'bg-blue-500'],
};

// Zod schema for request body
const BodySchema = z.object({
  slug: z.string().optional().default("default-slug"),
  html: z.string(), // required
  // config: z.object({
  //   content: z.array(z.string()).optional(),
  //   theme: z.record(z.any(), z.any()).optional(),
  //   plugins: z.array(z.any()).optional(),
  //   safelist: z.array(z.string()).optional(),
  // }).optional().default({}),
});

export const cssRoute = (service: CSSService) => {
  const app = new Hono();

  app.post("/", async (c) => {
    let body: z.infer<typeof BodySchema>;

    try {
      const jsonBody = await c.req.json();
      body = BodySchema.parse(jsonBody);
    } catch (err: any) {
      console.error("Invalid body:", err);
      return c.json({ error: "Invalid JSON body or missing fields" }, 400);
    }

    const { html } = body;
    console.log("Received HTML for CSS generation:", html?.substring(0, 100)); // Log first 100 chars
    try {
      const generatedCSS = await service.generateCSS(html);

      return new Response(generatedCSS, {
        status: 200,
        headers: {
          "Content-Type": "text/css",
          "Cache-Control": "public, max-age=3600",
        },
      });
    } catch (err: any) {
      console.error("Erro ao gerar CSS:", err);
      return c.json({ error: "Erro interno ao gerar CSS" }, 500);
    }
  });

  return app;
};
