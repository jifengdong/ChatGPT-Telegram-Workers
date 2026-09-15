import { iterSSEMessages } from './sse';
import { chunksToStream } from './testing';

async function collect(response: Response) {
    const result = [];
    for await (const sse of iterSSEMessages(response)) {
        result.push(sse);
    }
    return result;
}

describe('iterSSEMessages', () => {
    it('parses complete events', async () => {
        const response = new Response(chunksToStream(['event: message_start\ndata: {"a":1}\n\n', 'data: [DONE]\n\n']));
        await expect(collect(response)).resolves.toEqual([
            { event: 'message_start', data: '{"a":1}' },
            { event: null, data: '[DONE]' },
        ]);
    });

    it('joins events split across chunks', async () => {
        const response = new Response(chunksToStream(['data: {"a":', '1}\n\nev', 'ent: done\ndata: [DONE]\n\n']));
        await expect(collect(response)).resolves.toEqual([
            { event: null, data: '{"a":1}' },
            { event: 'done', data: '[DONE]' },
        ]);
    });

    it('handles CRLF line endings', async () => {
        const response = new Response(chunksToStream(['data: one\r\n\r\ndata: two\r\n\r\n']));
        await expect(collect(response)).resolves.toEqual([
            { event: null, data: 'one' },
            { event: null, data: 'two' },
        ]);
    });

    it('joins multi-line data with newline and ignores comments', async () => {
        const response = new Response(chunksToStream([': keep alive\n', 'data: line1\ndata: line2\n\n']));
        await expect(collect(response)).resolves.toEqual([{ event: null, data: 'line1\nline2' }]);
    });

    it('flushes a trailing event without final blank line', async () => {
        const response = new Response(chunksToStream(['data: tail']));
        await expect(collect(response)).resolves.toEqual([{ event: null, data: 'tail' }]);
    });

    it('throws when response has no body', async () => {
        const response = new Response(null);
        await expect(collect(response)).rejects.toThrow('no body');
    });
});
