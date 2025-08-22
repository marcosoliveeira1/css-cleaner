import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { PurgeCSSService } from "../types";
import { authMiddleware } from "../middlewares/auth";

const PurgeRequestSchema = z.object({
  html: z.string().openapi({
    example: '<html><body><div class="used">Hello</div></body></html>',
    description: 'O conteúdo HTML.'
  }),
  css: z.string().openapi({
    example: '.used { color: blue; } .unused { color: red; }',
    description: 'O conteúdo CSS ou uma URL para um arquivo CSS.'
  }),
});

const PurgeResponseSchema = z.object({
  css: z.string().openapi({
    example: '.used { color: blue; }'
  }),
});

const ErrorSchema = z.object({
  error: z.string(),
});

const route = createRoute({
  method: "post",
  path: "/",
  security: [{ Bearer: [] }],
  summary: "Otimiza o CSS removendo seletores não utilizados",
  request: {
    body: {
      content: {
        "application/json": {
          schema: PurgeRequestSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Retorna o CSS otimizado em um objeto JSON",
      content: {
        "application/json": {
          schema: PurgeResponseSchema,
        },
      },
    },
    400: {
      description: "Erro de validação ou parâmetros faltando",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    401: {
      description: "Não autorizado",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Erro interno do servidor",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const purgeRoute = (service: PurgeCSSService) => {
  const app = new OpenAPIHono();

  app.use("*", authMiddleware);

  app.openapi(route, async (c) => {
    try {
      const { html, css } = c.req.valid("json");

      let cssContent: string;
      if (css.startsWith("http")) {
        const resp = await fetch(css);
        if (!resp.ok) {
          return c.json({ error: `Falha ao buscar CSS da URL: ${resp.statusText}` }, 400);
        }
        cssContent = await resp.text();
      } else {
        cssContent = css;
      }

      const purgedCSS = await service.purge(html, cssContent);

      return c.json({ css: purgedCSS }, 200);
    } catch (err: any) {
      console.error("Erro no PurgeCSS:", err);
      return c.json({ error: "Erro interno ao processar PurgeCSS" }, 500);
    }
  });

  return app;
};