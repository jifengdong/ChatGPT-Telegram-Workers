import { ENV } from '@chatgpt-telegram-workers/core';
import convert from 'telegramify-markdown';

/** 当 DEFAULT_PARSE_MODE 为 MarkdownV2 时安装消息转义(等价原 workers-mk2 行为)。 */
export function applyMessageRender(): void {
    if (ENV.CONFIG.settings.defaultParseMode === 'MarkdownV2') {
        ENV.CUSTOM_MESSAGE_RENDER = (parseMode, message) => {
            if (parseMode === 'MarkdownV2') {
                return convert(message, 'remove');
            }
            return message;
        };
    }
}
