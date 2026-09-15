import type { Message } from '@chatgpt-telegram-workers/ai';
import type { AppConfig } from '@chatgpt-telegram-workers/config';
import type { ChatAgent, HistoryModifier, StreamHandler } from './types';
import { ENV } from '@chatgpt-telegram-workers/config';

function textOf(message: Message): string {
    if (typeof message.content === 'string') {
        return message.content;
    }
    return message.content
        .filter(part => part.type === 'text')
        .map(part => part.text)
        .join('');
}

/** 保留最近 maxLength 条与 maxToken 文本长度内的历史 */
function trimHistory(history: Message[], maxLength: number, maxToken: number): Message[] {
    let list = history;
    if (maxLength >= 0 && list.length > maxLength) {
        list = list.slice(-maxLength);
    }
    if (maxToken > 0) {
        let tokens = 0;
        for (let i = list.length - 1; i >= 0; i--) {
            tokens += textOf(list[i]).length;
            if (tokens > maxToken) {
                list = list.slice(i + 1);
                break;
            }
        }
    }
    return list;
}

async function loadHistory(key: string, config: AppConfig): Promise<Message[]> {
    let history: Message[] = [];
    try {
        const parsed = JSON.parse(await ENV.DATABASE.get(key));
        if (Array.isArray(parsed)) {
            history = parsed;
        }
    } catch (e) {
        console.error(e);
    }
    const { autoTrimHistory, maxHistoryLength, maxTokenLength } = config.settings;
    if (autoTrimHistory && maxHistoryLength > 0) {
        history = trimHistory(history, maxHistoryLength, maxTokenLength);
    }
    return history;
}

/** 用占位符替换消息中的图片,避免历史里堆积大体积 base64 */
function stripImages(message: Message, placeholder: string): Message {
    if (typeof message.content === 'string') {
        return message;
    }
    const imageCount = message.content.filter(part => part.type === 'image').length;
    const lastText = message.content.findLast(part => part.type === 'text');
    if (imageCount === 0 || !lastText) {
        return message;
    }
    const content = message.content
        .filter(part => part.type !== 'image')
        .map(part =>
            part === lastText
                ? { type: 'text' as const, text: part.text + ` ${placeholder}`.repeat(imageCount) }
                : part,
        );
    return { role: message.role, content };
}

/**
 * 加载历史、可选地交由 modifier 变换,再请求 agent,并按需写回历史。
 * 返回助手最终文本。
 */
export async function requestCompletionsFromLLM(
    message: Message | null,
    historyKey: string,
    config: AppConfig,
    agent: ChatAgent,
    modifier: HistoryModifier | null,
    onStream: StreamHandler | null,
): Promise<string> {
    if (!historyKey) {
        throw new Error('History key not found');
    }
    const { autoTrimHistory, maxHistoryLength, historyImagePlaceholder } = config.settings;
    const historyDisabled = autoTrimHistory && maxHistoryLength <= 0;

    let history = await loadHistory(historyKey, config);
    if (modifier) {
        const modified = modifier(history, message);
        history = modified.history;
        message = modified.message;
    }
    if (!message) {
        throw new Error('Message is empty');
    }

    const text = await agent.chat([...history, message], onStream);
    if (!historyDisabled) {
        const stored = historyImagePlaceholder ? stripImages(message, historyImagePlaceholder) : message;
        const next: Message[] = [...history, stored, { role: 'assistant', content: text }];
        await ENV.DATABASE.put(historyKey, JSON.stringify(next)).catch(console.error);
    }
    return text;
}
