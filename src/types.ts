export interface PurgeCSSService {
    purge(html: string, css: string): Promise<string>;
}