import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono } from '@hono/zod-openapi';
import { PurgeCSSWorkerService } from "./services/purgecss";
import { purgeRoute } from "./routes/purge";

type Bindings = { API_KEY: string };

const app = new OpenAPIHono<{ Bindings: Bindings }>();

app.openAPIRegistry.registerComponent('securitySchemes', 'Bearer', {
  type: 'http',
  scheme: 'bearer',
});

const purgeCSSService = new PurgeCSSWorkerService();

app.route("/purge", purgeRoute(purgeCSSService));

app.doc('/openapi.json', {
  openapi: '3.1.0',
  info: {
    title: 'CSS Purger API',
    version: 'v1',
    description: 'Uma API para remover CSS não utilizado de conteúdo HTML.',
  },
});

app.get('/', swaggerUI({ url: '/openapi.json' }));

export default app;