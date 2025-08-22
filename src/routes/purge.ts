import { Hono } from "hono";
import { PurgeCSSService } from "../types";

export const purgeRoute = (service: PurgeCSSService) => {
  const app = new Hono();

  app.post("/", async (c) => {
    try {
      const { slug, html, css } = await c.req.json<{
        slug: string;
        html: string;
        css: string;
      }>();

      if (!html || !css) {
        return c.json(
          { error: "Parâmetros faltando: html e css são obrigatórios" },
          400
        );
      }

      let cssContent: string;
      if (css.startsWith("http")) {
        const resp = await fetch(css);
        cssContent = await resp.text();
      } else {
        cssContent = css;
      }

      const purgedCSS = await service.purge(html, cssContent);

      return new Response(purgedCSS, {
        status: 200,
        headers: { "Content-Type": "text/css" },
      });
    } catch (err: any) {
      console.error("Erro no PurgeCSS:", err);
      return c.json({ error: "Erro interno ao processar PurgeCSS" }, 500);
    }
  });

  return app;
};