import { Hono } from "hono";
import { authMiddleware } from "./middlewares/auth";
import { TailwindCSSService } from "./services/tailwind-css.service";
import { cssRoute } from "./routes/css";

type Bindings = { API_KEY: string };

const app = new Hono<{ Bindings: Bindings }>();

// Middlewares globais
app.use("*", authMiddleware);

// Default Tailwind configuration
const defaultTailwindConfig = {
  theme: {
    extend: {
      // Add any custom theme extensions here
    }
  },
  plugins: [
    // Add any Tailwind plugins here if needed
  ],
  safelist: [
    // Add any classes that should always be included
    'text-red-500',
    'bg-blue-500',
    // Add more as needed
  ]
};

// Injeção de dependência
const tailwindService = new TailwindCSSService(defaultTailwindConfig);

// Rotas
app.route("/css", cssRoute(tailwindService));

// Root endpoint with API info
app.get("/", (c) => {
  return c.json({
    name: "Tailwind CSS JIT API",
    version: "1.0.0",
    endpoints: {
      "POST /css": "Generate CSS from HTML using Tailwind JIT",
      "GET /": "Test endpoint"
    }
  });
});


export default app;