import type { RequestTemplate } from './template';
import dicten from '../../../../plugins/dicten.json';
import { executeRequest, formatInput } from './template';

const dictenTemplate = dicten as unknown as RequestTemplate;

describe('template', () => {
    it('renders a JSON response through the output template', async () => {
        const payload = [{ word: 'example', phonetic: '/ɪɡˈzɑːmpəl/', meanings: [] }];
        const fetchMock = vi.fn(
            async (_url: string | URL | Request, _init?: RequestInit) =>
                new Response(JSON.stringify(payload), {
                    status: 200,
                    headers: { 'content-type': 'application/json' },
                }),
        );

        const result = await executeRequest(
            dictenTemplate,
            { DATA: 'example', ENV: {} },
            fetchMock as unknown as typeof fetch,
        );

        expect(result.type).toBe('html');
        expect(result.content).toContain('example');
        // URL 应带上用户输入
        expect(String(fetchMock.mock.calls[0][0])).toContain('/en/example');
    });

    it('renders the error template on a failed request', async () => {
        const fetchMock = vi.fn(
            async (_url: string | URL | Request, _init?: RequestInit) =>
                new Response(JSON.stringify({ message: 'not found' }), {
                    status: 404,
                    headers: { 'content-type': 'application/json' },
                }),
        );

        const result = await executeRequest(
            dictenTemplate,
            { DATA: 'zzz', ENV: {} },
            fetchMock as unknown as typeof fetch,
        );
        expect(result.content).toContain('not found');
    });

    it('formats input by type', () => {
        expect(formatInput('a b c', 'space-separated')).toEqual(['a', 'b', 'c']);
        expect(formatInput('a, b ,c', 'comma-separated')).toEqual(['a', 'b', 'c']);
        expect(formatInput('{"a":1}', 'json')).toEqual({ a: 1 });
        expect(formatInput('plain', 'text')).toBe('plain');
    });
});
