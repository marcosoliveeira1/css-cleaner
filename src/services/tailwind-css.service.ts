import { CSSService, TailwindConfig } from "../types";
import postcss from "postcss";
import tailwindcss from '@tailwindcss/postcss'

export class TailwindCSSService implements CSSService {
    private config: TailwindConfig;

    constructor(config?: TailwindConfig) {
        this.config = {
            content: [],
            theme: {},
            plugins: [],
            safelist: [],
            ...config
        };
    }

    async generateCSS(html: string): Promise<string> {
        // Base Tailwind CSS with all utilities
        const baseCSS = `
            @tailwind base;
            @tailwind components;
            @tailwind utilities;
        `;

        // Configure Tailwind to scan the provided HTML content
        const tailwindConfig = {
            ...this.config,
            content: [{ raw: html, extension: 'html' }],
            // JIT mode is enabled by default in Tailwind CSS v3+
            mode: 'jit' as const,
        };

        try {
            // Process CSS with PostCSS and Tailwind
            const result = await postcss([
                tailwindcss()
            ]).process(baseCSS, {
                from: undefined,
                to: undefined
            });

            return result.css;
        } catch (error) {
            console.error("Erro ao processar Tailwind CSS:", error);
            throw new Error(`Erro ao gerar CSS: ${error}`);
        }
    }

    // Method to generate CSS with custom Tailwind config
    async generateCSSWithConfig(html: string, customConfig: TailwindConfig): Promise<string> {
        const tempService = new TailwindCSSService(customConfig);
        return await tempService.generateCSS(html);
    }
}