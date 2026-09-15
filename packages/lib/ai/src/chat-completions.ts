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
import { contentToText, sumTokens } from './common';
import { joinUrl, parseJSONSync, postJSON } from './fetch';
import { adaptMessageImages, DEFAULT_IMAGE_MIME_TYPE, resolveImage, toDataURI } from './image';
import { imageAdaptMode } from './protocols';
import { iterSSEMessages, isDoneSentinel } from './sse';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';

function toUsage(usage: any): Usage | undefined {
    if (!usage) {
        return undefined;
    }
    const inputTokens = usage.prompt_tokens;
    const outputTokens = usage.completion_tokens;
    return {
        inputTokens,
        outputTokens,
        totalTokens: usage.total_tokens ?? sumTokens(inputTokens, outputTokens),
    };
}

function renderPart(part: Part): any | null {
    if (part.type === 'text') {
        return { type: 'text', text: part.text };
    }
    const image = resolveImage(part.image, part.mimeType || DEFAULT_IMAGE_MIME_TYPE);
    if (image.base64) {
        return {
            type: 'image_url',
            image_url: { url: toDataURI(image.base64, image.mimeType || DEFAULT_IMAGE_MIME_TYPE) },
        };
    }
    if (image.url) {
        return { type: 'image_url', image_url: { url: image.url } };
    }
    return null;
}

function renderMessage(message: Message): any {
    if (typeof message.content === 'string') {
        return { role: message.role, content: message.content };
    }
    return {
        role: message.role,
        content: message.content.map(renderPart).filter(part => part !== null),
    };
}

export function buildChatCompletionsBody(options: CompletionOptions, stream: boolean): any {
    const messages = [...options.messages];
    if (options.system) {
        messages.unshift({ role: 'system', content: options.system });
    }
    return {
        ...options.extra,
        model: options.model,
        ...(stream ? { stream: true } : {}),
        ...(options.maxTokens !== undefined ? { max_tokens: options.maxTokens } : {}),
        ...(options.temperature !== undefined ? { temperature: options.temperature } : {}),
        ...(options.topP !== undefined ? { top_p: options.topP } : {}),
        ...(options.stop ? { stop: options.stop } : {}),
        messages: messages.map(renderMessage),
    };
}

export function parseChatCompletionsResponse(data: any): CompletionResult {
    if (data?.error) {
        throw new Error(data.error.message || 'Unknown error');
    }
    const choice = data?.choices?.at(0);
    if (!choice) {
        throw new Error('Empty response from provider');
    }
    return {
        text: contentToText(choice.message?.content),
        usage: toUsage(data?.usage),
        stopReason: choice?.finish_reason ?? null,
    };
}

export function parseChatCompletionsSSE(sse: SSEMessage): SSEParseResult {
    if (isDoneSentinel(sse.data)) {
        return { finish: true };
    }
    const payload = parseJSONSync(sse.data);
    if (!payload) {
        return {};
    }
    if (payload.error) {
        return { error: payload.error.message || 'Unknown error' };
    }
    const delta = payload.choices?.at(0)?.delta?.content;
    return typeof delta === 'string' ? { delta } : {};
}

export class ChatCompletionsClient implements LLMClient {
    readonly protocol: Protocol = 'chat-completions';
    private readonly config: ClientConfig;

    constructor(config: ClientConfig = {}) {
        this.config = config;
    }

    private endpoint(): string {
        return joinUrl(this.config.baseUrl || DEFAULT_BASE_URL, '/chat/completions');
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
            body: buildChatCompletionsBody(adapted, stream),
            signal: options.signal,
            fetch: this.config.fetch,
        });
    }

    async complete(options: CompletionOptions): Promise<CompletionResult> {
        const response = await this.request(options, false);
        return parseChatCompletionsResponse(await response.json());
    }

    async *stream(options: CompletionOptions): AsyncIterable<string> {
        const response = await this.request(options, true);
        for await (const sse of iterSSEMessages(response)) {
            const { delta, finish, error } = parseChatCompletionsSSE(sse);
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
