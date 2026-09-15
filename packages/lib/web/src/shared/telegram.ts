/**
 * 获取 Telegram Mini App initData。
 * 优先读官方 SDK(window.Telegram.WebApp.initData);SDK 脚本(telegram.org)
 * 加载失败时,Telegram 写入页面 URL hash 的 tgWebAppData 仍然有效,直接解析兜底。
 * 两者拿到的是同一份原始 initData 字符串,服务端按参数解析校验,顺序无关。
 */
export function getTelegramInitData(): string {
    const fromSdk = window.Telegram?.WebApp?.initData;
    if (fromSdk) {
        return fromSdk;
    }
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
        return '';
    }
    return new URLSearchParams(hash).get('tgWebAppData') ?? '';
}

/** SDK 存在时调用 ready/expand,让 Mini App 正确展开视口 */
export function telegramWebAppReady(): void {
    try {
        window.Telegram?.WebApp?.ready?.();
        window.Telegram?.WebApp?.expand?.();
    } catch {
        // SDK 不存在时忽略
    }
}
