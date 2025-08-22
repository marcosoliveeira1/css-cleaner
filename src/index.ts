import { Hono } from "hono";
import { authMiddleware } from "./middlewares/auth";
import { PurgeCSSWorkerService } from "./services/purgecss";
import { purgeRoute } from "./routes/purge";
import { messageRoute } from "./routes/message";

type Bindings = { API_KEY: string };

const app = new Hono<{ Bindings: Bindings }>();

// Middlewares globais
app.use("*", authMiddleware);

// Injeção de dependência
const purgeCSSService = new PurgeCSSWorkerService();

// Rotas
app.route("/purge", purgeRoute(purgeCSSService));
app.route("/message", messageRoute);

export default app;