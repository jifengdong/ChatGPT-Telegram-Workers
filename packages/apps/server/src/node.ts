import * as fs from 'node:fs';
import * as process from 'node:process';
import { createApp, ENV, handleUpdate } from '@chatgpt-telegram-workers/core';
import { applyMessageRender } from './markdown';
import { runPolling } from './polling';
import { createCache, initEnv, installFetchProxy, serve } from './runtime';

interface Config {
    database: {
        type: 'memory' | 'local' | 'sqlite' | 'redis';
        path?: string;
    };
    server?: {
        hostname?: string;
        port?: number;
        baseURL: string;
    };
    proxy?: string;
    mode: 'webhook' | 'polling';
}

const { CONFIG_PATH = '/app/config.json', WRANGLER_PATH = '/app/wrangler.jsonc' } = process.env;

// 读取配置文件
const config: Config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));

// 初始化数据库
const cache = createCache(config?.database?.type, { uri: config.database.path || '' });
console.log(`database: ${config?.database?.type} is ready`);

// 初始化环境变量(wrangler.jsonc vars + DATABASE 绑定)
const env = initEnv(WRANGLER_PATH, { DATABASE: cache });

if (config.proxy) {
    installFetchProxy(config.proxy);
}

const app = createApp({
    onRequest: () => {
        ENV.merge(env);
        applyMessageRender();
    },
});

if (config.mode === 'webhook' && config.server !== undefined) {
    const port = config.server.port || 8787;
    const hostname = config.server.hostname || '0.0.0.0';
    serve(app, { port, hostname }, info => {
        console.log(`Listening on http://${info.address}:${info.port}`);
    });
} else {
    ENV.merge(env);
    applyMessageRender();
    runPolling(ENV.TELEGRAM_TOKEN ? [ENV.TELEGRAM_TOKEN] : [], handleUpdate).catch(console.error);
}
