import { createApp, ENV } from '@chatgpt-telegram-workers/core';

/**
 * Cloudflare Workers 入口:最小依赖、自包含单文件。
 * 配置(含管理页)全部来自 @chatgpt-telegram-workers/core,本包无需任何第三方运行时依赖。
 */
const app = createApp({
    onRequest: env => {
        ENV.merge((env as Record<string, any>) ?? {});
    },
});

export default app;
