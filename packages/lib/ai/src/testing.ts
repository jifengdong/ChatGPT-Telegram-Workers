export function sseResponse(events: string[]): Response {
    return new Response(chunksToStream(events), {
        status: 200,
        headers: { 'content-type': 'text/event-stream' },
    });
}

export function jsonResponse(data: any, status = 200): Response {
    return new Response(JSON.stringify(data), {
        status,
        headers: { 'content-type': 'application/json' },
    });
}

export function imageResponse(bytes: Uint8Array<ArrayBuffer>): Response {
    return new Response(bytes, {
        status: 200,
        headers: { 'content-type': 'image/png' },
    });
}

export function chunksToStream(chunks: string[]): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    return new ReadableStream<Uint8Array>({
        start(controller) {
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
            }
            controller.close();
        },
    });
}

export async function collectStream(iterable: AsyncIterable<string>): Promise<string[]> {
    const result: string[] = [];
    for await (const item of iterable) {
        result.push(item);
    }
    return result;
}

export function sseEvent(event: string | null, data: string): string {
    const lines = [`data: ${data}`];
    if (event !== null) {
        lines.unshift(`event: ${event}`);
    }
    return `${lines.join('\n')}\n\n`;
}
