import * as process from 'node:process';
import { createApp, ENV } from '@chatgpt-telegram-workers/core';
import { applyMessageRender } from './markdown';
import { createNodeHandler } from './runtime/http';
import { UpStashCache } from './runtime/upstash';

/**
 * Vercel(Node.js runtime)入口:配置来自 process.env,
 * 使用 Upstash Redis 作为 DATABASE。
 */
const app = createApp({
    onRequest: () => {
        const { UPSTASH_REDIS_REST_URL = '', UPSTASH_REDIS_REST_TOKEN = '' } = process.env;
        ENV.merge({
            ...process.env,
            ...(UPSTASH_REDIS_REST_URL && UPSTASH_REDIS_REST_TOKEN
                ? { DATABASE: UpStashCache.create(UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN) }
                : {}),
        });
        applyMessageRender();
    },
});

export default createNodeHandler(app);
