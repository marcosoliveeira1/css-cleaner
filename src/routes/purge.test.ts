import { describe, it, expect, vi, afterEach } from 'vitest';
import app from '../index'; // Importamos a instância principal da aplicação Hono
import { PurgeCSSWorkerService } from '../services/purgecss';

describe('Rota /purge', () => {
    const validApiKey = 'test-api-key';
    const MOCK_ENV = { API_KEY: validApiKey };

    // Limpa os mocks após cada teste para evitar interferência
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('deve retornar 401 Unauthorized se o token de autorização estiver faltando', async () => {
        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ html: 'test', css: 'test' }),
        });

        const res = await app.request(req, {}, MOCK_ENV); // Injetamos o env
        const json = await res.json();

        expect(res.status).toBe(401);
        expect(json).toEqual({ error: 'Não autorizado' });
    });

    it('deve retornar 401 Unauthorized se o token de autorização for inválido', async () => {
        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer invalid-token',
            },
            body: JSON.stringify({ html: 'test', css: 'test' }),
        });

        const res = await app.request(req, {}, MOCK_ENV); // Injetamos o env
        expect(res.status).toBe(401);
    });

    it('deve retornar 400 Bad Request se os parâmetros html ou css estiverem faltando', async () => {
        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validApiKey}`,
            },
            body: JSON.stringify({ html: '<div></div>' }), // Faltando o css
        });

        const res = await app.request(req, {}, MOCK_ENV); // Injetamos o env
        const json = await res.json() as { success: boolean; error?: string };

        expect(res.status).toBe(400);
        // O erro agora vem do Zod, então a mensagem é diferente
        expect(json.success).toBe(false);
    });

    it('deve processar a requisição com sucesso e retornar o CSS otimizado', async () => {
        const html = '<html><body><div class="used">Hello</div></body></html>';
        const css = '.used { color: blue; } .unused { color: red; }';

        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validApiKey}`,
            },
            body: JSON.stringify({ html, css }),
        });

        const res = await app.request(req, {}, MOCK_ENV); // Injetamos o env
        const body = await res.json() as { css: string };

        expect(res.status).toBe(200);
        expect(res.headers.get('Content-Type')).toContain('application/json');
        expect(body.css).toContain('.used');
        expect(body.css).not.toContain('.unused');
    });

    it('deve buscar o CSS de uma URL e processá-lo com sucesso', async () => {
        const mockCss = '.from-url { font-size: 16px; }';
        // Mockamos o fetch global para não fazer uma requisição de rede real
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(mockCss));

        const html = '<h1 class="from-url">Title</h1>';
        const cssUrl = 'https://example.com/style.css';

        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validApiKey}`,
            },
            body: JSON.stringify({ html, css: cssUrl }),
        });

        const res = await app.request(req, {}, MOCK_ENV);
        const body = await res.json() as { css: string };;

        expect(res.status).toBe(200);
        expect(globalThis.fetch).toHaveBeenCalledWith(cssUrl);
        expect(body.css).toContain('.from-url');
    });

    it('deve retornar 400 se a URL do CSS não puder ser alcançada', async () => {
        // Mockamos o fetch para simular um erro 404
        vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('Not Found', { status: 404, statusText: 'Not Found' }));

        const html = '<h1>Hello</h1>';
        const cssUrl = 'https://example.com/non-existent.css';

        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validApiKey}`,
            },
            body: JSON.stringify({ html, css: cssUrl }),
        });

        const res = await app.request(req, {}, MOCK_ENV);
        const body = await res.json() as { error: string };

        expect(res.status).toBe(400);
        expect(body.error).toContain('Falha ao buscar CSS da URL');
    });

    it('deve retornar 500 se o serviço de purge falhar', async () => {
        // Mockamos o método 'purge' do serviço para lançar um erro
        vi.spyOn(PurgeCSSWorkerService.prototype, 'purge').mockRejectedValue(new Error('Erro catastrófico'));

        const html = '<h1>Hello</h1>';
        const css = '.test {}';

        const req = new Request('http://localhost/purge', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${validApiKey}`,
            },
            body: JSON.stringify({ html, css }),
        });

        const res = await app.request(req, {}, MOCK_ENV);
        const body = await res.json() as { error: string };

        expect(res.status).toBe(500);
        expect(body.error).toBe('Erro interno ao processar PurgeCSS');
    });
});