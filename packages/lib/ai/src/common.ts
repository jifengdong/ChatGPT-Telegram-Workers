import type { CompletionOptions, Message } from './types';

export function contentToText(content: unknown): string {
    if (typeof content === 'string') {
        return content;
    }
    if (Array.isArray(content)) {
        return content
            .filter((item: any) => item?.type === 'text')
            .map((item: any) => item.text ?? '')
            .join('');
    }
    return '';
}

/**
 * 分离 system 与普通消息:options.system 与 messages 里的 system 消息合并成一个顶层 system 文本
 */
export function extractSystem(options: CompletionOptions): { system?: string; messages: Message[] } {
    const systems: string[] = [];
    if (options.system) {
        systems.push(options.system);
    }
    const messages: Message[] = [];
    for (const message of options.messages) {
        if (message.role === 'system') {
            const text = contentToText(message.content);
            if (text) {
                systems.push(text);
            }
        } else {
            messages.push(message);
        }
    }
    return { system: systems.length > 0 ? systems.join('\n\n') : undefined, messages };
}

export function sumTokens(inputTokens?: number, outputTokens?: number): number | undefined {
    if (inputTokens === undefined || outputTokens === undefined) {
        return undefined;
    }
    return inputTokens + outputTokens;
}
