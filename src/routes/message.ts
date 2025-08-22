import { Hono } from "hono";

export const messageRoute = new Hono();

messageRoute.get("/", (c) => c.text("Hello Hono + SOLID!"));