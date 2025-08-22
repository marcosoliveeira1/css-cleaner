import { describe, it, expect, vi } from 'vitest';
import { PurgeCSS, __mocks } from 'purgecss';
import { PurgeCSSWorkerService } from './purgecss';

import type { Mock } from 'vitest';

declare module 'purgecss' {
    export const __mocks: {
        purge: Mock;
    };
}


vi.mock('purgecss', () => {
    const purge = vi.fn().mockResolvedValue([{ css: '.purged {}' }]);
    const PurgeCSS = vi.fn().mockImplementation(() => ({ purge }));
    return { PurgeCSS, __mocks: { purge } };
});

describe('PurgeCSSWorkerService', () => {
    it('deve chamar o PurgeCSS com o html e css corretos', async () => {
        const service = new PurgeCSSWorkerService();
        const html = '<div></div>';
        const css = '.test {}';

        const result = await service.purge(html, css);

        expect(PurgeCSS).toHaveBeenCalled();

        expect(__mocks.purge).toHaveBeenCalledWith({
            content: [{ raw: html, extension: 'html' }],
            css: [{ raw: css }],
        });

        expect(result).toBe('.purged {}');
    });
});
