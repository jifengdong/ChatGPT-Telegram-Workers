import { adaptMessageImages, fetchImageAsBase64 } from './image';
import { imageResponse } from './testing';

/** PNG 魔数,base64 首字符为 'i',可被格式嗅探识别 */
const PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const PNG_BASE64 = 'iVBORw0KGgo=';

describe('fetchImageAsBase64', () => {
    it('fetches a remote image and sniffs the mime type', async () => {
        const fetchMock = vi.fn().mockResolvedValue(imageResponse(PNG_BYTES));
        const result = await fetchImageAsBase64('https://example.com/a.png', fetchMock as any);
        expect(result).toEqual({ base64: PNG_BASE64, mimeType: 'image/png' });
        expect(fetchMock).toHaveBeenCalledWith('https://example.com/a.png');
    });

    it('throws on http failure', async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response('nope', { status: 404 }));
        await expect(fetchImageAsBase64('https://example.com/missing.png', fetchMock as any)).rejects.toThrow('404');
    });
});

describe('adaptMessageImages', () => {
    const messages = [
        { role: 'system' as const, content: 'sys' },
        {
            role: 'user' as const,
            content: [
                { type: 'text' as const, text: 'look' },
                { type: 'image' as const, image: 'https://example.com/remote.png' },
                { type: 'image' as const, image: 'data:image/png;base64,QUJD' },
                { type: 'image' as const, image: new Uint8Array([1, 2, 3]), mimeType: 'image/png' },
            ],
        },
    ];

    it('keeps messages untouched in url mode', async () => {
        expect(await adaptMessageImages(messages, 'url')).toBe(messages);
    });

    it('strips image parts in none mode', async () => {
        const adapted = await adaptMessageImages(messages, 'none');
        expect(adapted[0]).toEqual({ role: 'system', content: 'sys' });
        expect(adapted[1].content).toEqual([{ type: 'text', text: 'look' }]);
    });

    it('inlines remote urls as data uris in base64 mode', async () => {
        const fetchMock = vi.fn().mockResolvedValue(imageResponse(PNG_BYTES));
        const adapted = await adaptMessageImages(messages, 'base64', fetchMock as any);
        const content = adapted[1].content as any[];
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(content[1]).toEqual({ type: 'image', image: `data:image/png;base64,${PNG_BASE64}` });
        // data URI 与 bytes 不走网络,原样保留
        expect(content[2]).toEqual({ type: 'image', image: 'data:image/png;base64,QUJD' });
        expect(content[3].image).toBeInstanceOf(Uint8Array);
    });

    it('caches repeated fetches for the same url', async () => {
        const fetchMock = vi.fn().mockResolvedValue(imageResponse(PNG_BYTES));
        const repeated = [
            { role: 'user' as const, content: [{ type: 'image' as const, image: 'https://example.com/cached.png' }] },
            { role: 'user' as const, content: [{ type: 'image' as const, image: 'https://example.com/cached.png' }] },
        ];
        await adaptMessageImages(repeated, 'base64', fetchMock as any);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});
