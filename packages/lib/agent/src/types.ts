import type { Message, Part } from '@chatgpt-telegram-workers/ai';

export type { Message, Part };

/** 流式输出回调,参数为当前累计文本 */
export type StreamHandler = (text: string) => Promise<unknown>;

/** 请求前对历史与当前消息做变换(如 /redo 回退上一条) */
export interface HistoryModifierResult {
    history: Message[];
    message: Message;
}

export type HistoryModifier = (history: Message[], message: Message | null) => HistoryModifierResult;

export interface AgentBase {
    name: string;
    label: string;
    model: string;
    modelList: () => Promise<string[]>;
}

export interface ChatAgent extends AgentBase {
    /** 发送一轮对话,返回助手最终文本;onStream 非空时以增量文本回调 */
    chat: (messages: Message[], onStream: StreamHandler | null) => Promise<string>;
}

export interface ImageAgent extends AgentBase {
    /** 生成图片,返回远程 URL 或图片 Blob */
    generate: (prompt: string) => Promise<string | Blob>;
}
