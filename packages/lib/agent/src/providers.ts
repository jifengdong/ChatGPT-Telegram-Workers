import type { ClientConfig, CompletionOptions } from '@chatgpt-telegram-workers/ai';
import type { AppSettings, ChatProviderConfig, ImageProviderConfig } from '@chatgpt-telegram-workers/config';
import type { ChatAgent, ImageAgent } from './types';
import { createClient, createImageClient, findChatProtocol } from '@chatgpt-telegram-workers/ai';
import { consumeTextStream } from './stream';

/** 走 HTTP 客户端的聊天协议(workers 有独立入口) */
export type HttpChatProtocol = 'chat-completions' | 'anthropic-messages' | 'responses';

/**
 * 按 `chatCompleteApiTimeout`(秒,<=0 表示不限)创建超时控制器。
 * 返回 clear,调用方在请求结束后必须清理,避免定时器泄漏。
 */
export function chatAbortSignal(settings: AppSettings): { signal?: AbortSignal; clear: () => void } {
    if (settings.chatCompleteApiTimeout <= 0) {
        return { clear: () => {} };
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), settings.chatCompleteApiTimeout * 1000);
    return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

/** 从 provider.options 读取 API Key 的自定义请求头名(Azure 用 `api-key`) */
function apiKeyHeader(provider: ChatProviderConfig): string | undefined {
    const value = provider.options?.apiKeyHeader;
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function clientConfig(provider: ChatProviderConfig, settings: AppSettings): ClientConfig {
    return {
        baseUrl: provider.baseUrl || undefined,
        apiKey: provider.apiKey || undefined,
        apiKeyHeader: apiKeyHeader(provider),
        // 仅对同时支持 URL 与 base64 的协议生效;anthropic 恒内联、workers 恒剥离,由 ai 客户端按协议能力决定
        imageTransfer: settings.telegramImageTransferMode,
    };
}

/** 按协议与实例组装走 HTTP 的聊天 agent(workers 走 workersai.ts) */
export function createChatAgent(
    protocol: HttpChatProtocol,
    provider: ChatProviderConfig,
    settings: AppSettings,
): ChatAgent {
    const client = createClient(protocol, clientConfig(provider, settings));
    return {
        name: provider.id,
        label: provider.label || findChatProtocol(protocol)?.label || protocol,
        model: provider.model || provider.models[0] || '',
        modelList: async () => provider.models,
        chat: async (messages, onStream) => {
            const extra = provider.extraParams ?? {};
            const { signal, clear } = chatAbortSignal(settings);
            const options: CompletionOptions = {
                model: provider.model,
                system: settings.systemInitMessage || undefined,
                messages,
                signal,
                ...(settings.maxOutputTokens > 0 ? { maxTokens: settings.maxOutputTokens } : {}),
                ...(Object.keys(extra).length ? { extra } : {}),
            };
            try {
                if (onStream) {
                    return await consumeTextStream(
                        client.stream(options),
                        onStream,
                        settings.telegramMinStreamInterval,
                    );
                }
                return (await client.complete(options)).text;
            } finally {
                clear();
            }
        },
    };
}

/** 组装 OpenAI Images 协议的图片 agent(workers 走 workersai.ts) */
export function createImageAgent(provider: ImageProviderConfig): ImageAgent {
    const client = createImageClient('images', {
        model: provider.model,
        baseUrl: provider.baseUrl || undefined,
        apiKey: provider.apiKey || undefined,
        extraParams: provider.extraParams,
    });
    return {
        name: provider.id,
        label: provider.label || 'OpenAI Images',
        model: provider.model || provider.models[0] || '',
        modelList: async () => provider.models,
        generate: prompt => client.generate(prompt),
    };
}
