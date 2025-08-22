
import { PurgeCSSService } from "../types";
import { PurgeCSS } from "purgecss";

export class PurgeCSSWorkerService implements PurgeCSSService {
    async purge(html: string, css: string): Promise<string> {
        const purgeCSSResult = await new PurgeCSS().purge({
            content: [{ raw: html, extension: "html" }],
            css: [{ raw: css }],
        });
        return purgeCSSResult[0].css;
    }
}
