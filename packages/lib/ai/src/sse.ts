export interface SSEMessage {
    event: string | null;
    data: string;
}

/**
 * 结束哨兵:部分网关会在 `[DONE]` 后附带空白/额外内容,
 * 因此按“去空白后以 [DONE] 开头”判断,避免流一直挂到连接关闭。
 */
export function isDoneSentinel(data: string): boolean {
    return data.trim().startsWith('[DONE]');
}

class LineDecoder {
    private static NEWLINE_REGEXP = /\r\n|[\n\r]/g;
    private buffer = '';
    private trailingCR = false;
    private textDecoder: TextDecoder | null = null;

    decode(chunk: Uint8Array): string[] {
        let text = this.decodeText(chunk);
        if (this.trailingCR) {
            text = `\r${text}`;
            this.trailingCR = false;
        }
        if (text.endsWith('\r')) {
            this.trailingCR = true;
            text = text.slice(0, -1);
        }
        if (!text) {
            return [];
        }
        const trailingNewline = text[text.length - 1] === '\n' || text[text.length - 1] === '\r';
        let lines = text.split(LineDecoder.NEWLINE_REGEXP);
        if (lines.length === 1 && !trailingNewline) {
            this.buffer += lines[0];
            return [];
        }
        if (this.buffer.length > 0) {
            lines = [this.buffer + lines[0], ...lines.slice(1)];
            this.buffer = '';
        }
        if (!trailingNewline) {
            this.buffer = lines.pop() || '';
        }
        return lines;
    }

    flush(): string[] {
        const lines = this.buffer ? [this.buffer] : [];
        this.buffer = '';
        this.trailingCR = false;
        return lines;
    }

    private decodeText(chunk: Uint8Array): string {
        if (!this.textDecoder) {
            this.textDecoder = new TextDecoder('utf-8');
        }
        return this.textDecoder.decode(chunk, { stream: true });
    }
}

class SSEDecoder {
    private event: string | null = null;
    private data: string[] = [];

    decode(line: string): SSEMessage | null {
        if (line.endsWith('\r')) {
            line = line.substring(0, line.length - 1);
        }
        if (!line) {
            if (this.event === null && this.data.length === 0) {
                return null;
            }
            const sse: SSEMessage = {
                event: this.event,
                data: this.data.join('\n'),
            };
            this.event = null;
            this.data = [];
            return sse;
        }
        if (line.startsWith(':')) {
            return null;
        }
        const index = line.indexOf(':');
        const fieldName = index === -1 ? line : line.substring(0, index);
        let value = index === -1 ? '' : line.substring(index + 1);
        if (value.startsWith(' ')) {
            value = value.substring(1);
        }
        if (fieldName === 'event') {
            this.event = value;
        } else if (fieldName === 'data') {
            this.data.push(value);
        }
        return null;
    }

    flush(): SSEMessage | null {
        if (this.event === null && this.data.length === 0) {
            return null;
        }
        const sse: SSEMessage = {
            event: this.event,
            data: this.data.join('\n'),
        };
        this.event = null;
        this.data = [];
        return sse;
    }
}

export async function* iterSSEMessages(response: Response): AsyncGenerator<SSEMessage> {
    if (!response.body) {
        throw new Error('Attempted to iterate over a response with no body');
    }
    const lineDecoder = new LineDecoder();
    const sseDecoder = new SSEDecoder();
    const reader = response.body.getReader();
    try {
        let done = false;
        while (!done) {
            const result = await reader.read();
            done = result.done;
            if (result.value) {
                for (const line of lineDecoder.decode(result.value)) {
                    const sse = sseDecoder.decode(line);
                    if (sse) {
                        yield sse;
                    }
                }
            }
        }
        for (const line of lineDecoder.flush()) {
            const sse = sseDecoder.decode(line);
            if (sse) {
                yield sse;
            }
        }
        const remaining = sseDecoder.flush();
        if (remaining) {
            yield remaining;
        }
    } finally {
        reader.cancel().catch(() => {});
    }
}
