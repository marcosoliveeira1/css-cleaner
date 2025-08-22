export interface CSSService {
    generateCSS(html: string): Promise<string>;
}

export interface TailwindConfig {
    content?: string[];
    theme?: Record<string, any>;
    plugins?: any[];
    safelist?: string[];
}