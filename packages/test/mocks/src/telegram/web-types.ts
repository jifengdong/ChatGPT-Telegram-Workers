export interface WebChatSeed {
    id: number;
    type: 'private' | 'group' | 'supergroup';
    title: string;
    userId: number;
    userName?: string;
    isBot?: boolean;
}

export interface WebKeyboardButton {
    text: string;
    data: string;
}

export interface WebMessage {
    id: number;
    chatId: number;
    text: string;
    fromBot: boolean;
    parseMode?: string | null;
    keyboard?: WebKeyboardButton[][];
}

export interface WebState {
    chats: WebChatSeed[];
    messages: WebMessage[];
}

export interface SendMessageOptions {
    chatId: number;
    userId?: number;
    text: string;
}
