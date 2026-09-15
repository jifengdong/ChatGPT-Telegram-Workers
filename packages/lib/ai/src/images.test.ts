import { createImageClient } from './images';
import { jsonResponse } from './testing';

describe('createImageClient (openai images)', () => {
    it('posts to the images endpoint and returns the generated url', async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ url: 'https://cdn.example/img.png' }] }));
        const client = createImageClient('images', {
            model: 'gpt-image-1',
            apiKey: 'sk',
            baseUrl: 'https://proxy.example/v1/',
            extraParams: { size: '1024x1024' },
            fetch: fetchMock as any,
        });
        await expect(client.generate('a cat')).resolves.toBe('https://cdn.example/img.png');

        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toBe('https://proxy.example/v1/images/generations');
        expect(init.headers.Authorization).toBe('Bearer sk');
        expect(JSON.parse(init.body)).toEqual({ prompt: 'a cat', n: 1, size: '1024x1024', model: 'gpt-image-1' });
    });

    it('merges protocol/model specific params from extraParams', async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ url: 'https://cdn.example/img.png' }] }));
        const client = createImageClient('images', {
            model: 'dall-e-3',
            extraParams: { quality: 'hd', style: 'vivid', size: '1792x1024' },
            fetch: fetchMock as any,
        });
        await client.generate('a cat');
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
            prompt: 'a cat',
            n: 1,
            model: 'dall-e-3',
            quality: 'hd',
            style: 'vivid',
            size: '1792x1024',
        });
    });

    it('keeps prompt, n and model authoritative over extraParams', async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ data: [{ url: 'https://cdn.example/img.png' }] }));
        const client = createImageClient('images', {
            model: 'dall-e-3',
            extraParams: { prompt: 'hijacked', n: 99, model: 'evil' },
            fetch: fetchMock as any,
        });
        await client.generate('a cat');
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
            prompt: 'a cat',
            n: 1,
            model: 'dall-e-3',
        });
    });

    it('throws provider errors and missing urls', async () => {
        const errorClient = createImageClient('images', {
            model: 'm',
            fetch: vi.fn().mockResolvedValue(jsonResponse({ error: { message: 'billing' } })) as any,
        });
        await expect(errorClient.generate('x')).rejects.toThrow('billing');

        const emptyClient = createImageClient('images', {
            model: 'm',
            fetch: vi.fn().mockResolvedValue(jsonResponse({ data: [{}] })) as any,
        });
        await expect(emptyClient.generate('x')).rejects.toThrow('no url');
    });
});

describe('createImageClient (workers)', () => {
    it('generates through the binding and returns a blob', async () => {
        const binding = {
            run: vi.fn().mockResolvedValue({ image: 'AQID' }),
        };
        const client = createImageClient('workers', { model: 'stable-diffusion-xl', binding: binding as any });
        const blob = await client.generate('a cat');
        expect(blob).toBeInstanceOf(Blob);
        expect(binding.run).toHaveBeenCalledWith('stable-diffusion-xl', { prompt: 'a cat' });
    });

    it('merges model specific params into the binding call', async () => {
        const binding = {
            run: vi.fn().mockResolvedValue({ image: 'AQID' }),
        };
        const client = createImageClient('workers', {
            model: '@cf/black-forest-labs/flux-1-schnell',
            extraParams: { num_steps: 4, width: 1024, height: 1024 },
            binding: binding as any,
        });
        await client.generate('a cat');
        expect(binding.run).toHaveBeenCalledWith('@cf/black-forest-labs/flux-1-schnell', {
            prompt: 'a cat',
            num_steps: 4,
            width: 1024,
            height: 1024,
        });
    });
});
