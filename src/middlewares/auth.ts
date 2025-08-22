import type { Context, Next,  } from "hono";

export const authMiddleware = async (c: Context<{ Bindings: { API_KEY: string } }>, next: Next) => {
    const auth = c.req.header("Authorization");
    if (!auth || auth !== `Bearer ${c.env.API_KEY}`) {
        return c.json({ error: "Não autorizado" }, 401);
    }
    await next();
};