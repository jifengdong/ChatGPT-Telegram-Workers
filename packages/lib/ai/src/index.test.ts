import { bytesToBase64, parseDataURI, resolveImage } from './image';
import { createClient } from './index';

describe('createClient', () => {
    it('creates clients by protocol', () => {
        expect(createClient('anthropic-messages').protocol).toBe('anthropic-messages');
        expect(createClient('chat-completions').protocol).toBe('chat-completions');
        expect(createClient('responses').protocol).toBe('responses');
        expect(createClient('workers').protocol).toBe('workers');
    });

    it('throws on unknown protocol', () => {
        expect(() => createClient('unknown' as any)).toThrow('Unknown protocol');
    });
});

describe('image utils', () => {
    it('encodes bytes across chunk boundaries', () => {
        const bytes = new Uint8Array([1, 2, 3]);
        expect(bytesToBase64(bytes)).toBe('AQID');

        const large = new Uint8Array(100000).map((_, i) => i % 251);
        expect(bytesToBase64(large)).toBe(Buffer.from(large).toString('base64'));
    });

    it('parses data URIs', () => {
        expect(parseDataURI('data:image/webp;base64,QUJD')).toEqual({ mimeType: 'image/webp', base64: 'QUJD' });
        expect(parseDataURI('https://example.com/cat.png')).toBeNull();
    });

    it('resolves urls bytes and data URIs', () => {
        expect(resolveImage('https://example.com/cat.png')).toEqual({ url: 'https://example.com/cat.png' });
        expect(resolveImage(new URL('https://example.com/cat.png'))).toEqual({ url: 'https://example.com/cat.png' });
        expect(resolveImage(new Uint8Array([1, 2, 3]), 'image/png')).toEqual({ base64: 'AQID', mimeType: 'image/png' });
        expect(resolveImage('data:image/webp;base64,QUJD')).toEqual({ base64: 'QUJD', mimeType: 'image/webp' });
    });
});
