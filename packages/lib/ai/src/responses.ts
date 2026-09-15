import type { SSEMessage } from './sse';
import type {
    ClientConfig,
    CompletionOptions,
    CompletionResult,
    LLMClient,
    Message,
    Part,
    Protocol,
    SSEParseResult,
    Usage,
} from './types';
import { extractSystem, sumTokens } from './common';
import { joinUrl, parseJSONSync, postJSON } from './fetch';
import { adaptMessageImages, DEFAULT_IMAGE_MIME_TYPE, resolveImage, toDataURI } from './image';
import { imageAdaptMode } from './protocols';
import { iterSSEMessages, isDoneSentinel } from './sse';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function toUsage(usage: any): Usage | undefined {
    if (!usage) {
        return undefined;
    }
    const inputTokens = usage.input_tokens;
    const outputTokens = usage.output_tokens;
    return {
        inputTokens,
        outputTokens,
        totalTokens: usage.total_tokens ?? sumTokens(inputTokens, outputTokens),
    };
}

function textPartType(role: Message['role']): 'input_text' | 'output_text' {
    return role === 'assistant' ? 'output_text' : 'input_text';
}

function renderPart(part: Part, role: Message['role']): any | null {
    if (part.type === 'text') {
        return { type: textPartType(role), text: part.text };
    }
    const image = resolveImage(part.image, part.mimeType || DEFAULT_IMAGE_MIME_TYPE);
    if (image.base64) {
        return { type: 'input_image', image_url: toDataURI(image.base64, image.mimeType || DEFAULT_IMAGE_MIME_TYPE) };
    }
    if (image.url) {
        return { type: 'input_image', image_url: image.url };
    }
    return null;
}

function renderContent(message: Message): any[] {
    if (typeof message.content === 'string') {
        return [{ type: textPartType(message.role), text: message.content }];
    }
    return message.content.map(part => renderPart(part, message.role)).filter(part => part !== null);
}

export function buildResponsesBody(options: CompletionOptions, stream: boolean): any {
    const { system, messages } = extractSystem(options);
    return {
        ...options.extra,
        model: options.model,
        ...(system ? { instructions: system } : {}),
        ...(stream ? { stream: true } : {}),
        ...(options.maxTokens !== undefined ? { max_output_tokens: options.maxTokens } : {}),
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
        ...(options.topP !== undefined ? { top_p: options.topP } : {}),
        input: messages.map(message => ({
            role: message.role,
            content: renderContent(message),
        })),
    };
}

export function parseResponsesResponse(data: any): CompletionResult {
    if (data?.error) {
        throw new Error(data.error.message || 'Unknown error');
    }
    const text = (data?.output || [])
        .flatMap((item: any) => item?.content || [])
        .filter((item: any) => item?.type === 'output_text')
        .map((item: any) => item.text ?? '')
        .join('');
    const incomplete = data?.incomplete_details?.reason;
    return {
        text,
        usage: toUsage(data?.usage),
        stopReason: incomplete ?? (data?.status === 'completed' ? 'stop' : null),
    };
}

export function parseResponsesSSE(sse: SSEMessage): SSEParseResult {
    if (isDoneSentinel(sse.data)) {
        return { finish: true };
    }
    const payload = parseJSONSync(sse.data);
    if (!payload) {
        return {};
    }
    switch (payload.type || sse.event) {
        case 'response.output_text.delta':
            return typeof payload.delta === 'string' ? { delta: payload.delta } : {};
        case 'response.completed':
        case 'response.incomplete':
            return { finish: true };
        case 'response.failed':
            return { error: payload.response?.error?.message || 'Response failed' };
        case 'error':
            return { error: payload.message || 'Unknown error' };
        default:
            return {};
    }
}

export class ResponsesClient implements LLMClient {
    readonly protocol: Protocol = 'responses';
    private readonly config: ClientConfig;

    constructor(config: ClientConfig = {}) {
        this.config = config;
    }

    private endpoint(): string {
        return joinUrl(this.config.baseUrl || DEFAULT_BASE_URL, '/responses');
    }

    private headers(options: CompletionOptions, stream: boolean): Record<string, string> {
        const keyHeader = this.config.apiKeyHeader || 'authorization';
        const apiKeyValue = this.config.apiKeyHeader ? this.config.apiKey : `Bearer ${this.config.apiKey}`;
        return {
            'content-type': 'application/json',
            ...(stream ? { accept: 'text/event-stream' } : {}),
            ...(this.config.apiKey ? { [keyHeader]: apiKeyValue } : {}),
            ...this.config.headers,
            ...options.headers,
        };
    }

    private async request(options: CompletionOptions, stream: boolean): Promise<Response> {
        const mode = imageAdaptMode(this.protocol, this.config.imageTransfer);
        const adapted = { ...options, messages: await adaptMessageImages(options.messages, mode, this.config.fetch) };
        return postJSON(this.endpoint(), {
            headers: this.headers(options, stream),
            body: buildResponsesBody(adapted, stream),
            signal: options.signal,
            fetch: this.config.fetch,
        });
    }

    async complete(options: CompletionOptions): Promise<CompletionResult> {
        const response = await this.request(options, false);
        return parseResponsesResponse(await response.json());
    }

    async *stream(options: CompletionOptions): AsyncIterable<string> {
        const response = await this.request(options, true);
        for await (const sse of iterSSEMessages(response)) {
            const { delta, finish, error } = parseResponsesSSE(sse);
            if (error) {
                throw new Error(error);
            }
            if (finish) {
                return;
            }
            if (delta) {
                yield delta;
            }
        }
    }
}
