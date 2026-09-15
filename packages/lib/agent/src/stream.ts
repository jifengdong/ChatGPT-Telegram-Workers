import type { StreamHandler } from './types';

/** 每累计这么多字符推送一次,避免过于频繁的 Telegram 编辑 */
const UPDATE_STEP = 30;

/**
 * 消费文本增量流,返回完整文本。onStream 收到的是"当前累计文本 + 省略号",
 * minIntervalMs 限制两次回调的最小间隔(0 表示不限制)。
 * 超时中断(AbortError)保留已生成的部分静默返回;其它错误保留部分并附加错误信息。
 */
export async function consumeTextStream(
    stream: AsyncIterable<string>,
    onStream: StreamHandler,
    minIntervalMs = 0,
): Promise<string> {
    let text = '';
    let emitted = 0;
    let lastEmitAt = 0;
    try {
        for await (const delta of stream) {
            text += delta;
            const now = Date.now();
            if (text.length - emitted < UPDATE_STEP || now - lastEmitAt < minIntervalMs) {
                continue;
            }
            emitted = text.length;
            lastEmitAt = now;
            await onStream(`${text}\n...`);
        }
    } catch (e) {
        // 超时/主动中断不是内容错误,不要写入历史
        if ((e as Error)?.name !== 'AbortError') {
            text += `\nError: ${(e as Error).message}`;
        }
    }
    return text;
}
