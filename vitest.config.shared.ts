import * as path from 'node:path';
import { cloudflareTest } from '@cloudflare/vitest-pool-workers';
import { defineConfig } from 'vitest/config';

export interface VitestOptions {
    /** 包根目录,通常传 __dirname */
    root: string;
    /** 是否启用 `#/*` -> `src/*` 别名 */
    hashAlias?: boolean;
    /** 需要指向源码的 workspace 包名(不含 scope 前缀),如 ['ai','config'] */
    workspaceDeps?: string[];
}

/**
 * 共享 Vitest 配置:测试在 workerd(Miniflare) 中运行,
 * 便于直接使用 Workers 运行时 API 与 KV 绑定,且与生产环境一致。
 */
export function createVitestConfig(options: VitestOptions) {
    const root = options.root;
    const alias: { find: string | RegExp; replacement: string }[] = [];
    if (options.hashAlias) {
        alias.push({ find: /^#\/(.*)$/, replacement: `${path.resolve(root, 'src')}/$1` });
    }
    for (const dep of options.workspaceDeps || []) {
        alias.push({
            find: `@chatgpt-telegram-workers/${dep}`,
            replacement: path.resolve(root, `../${dep}/src/index.ts`),
        });
    }
    return defineConfig({
        plugins: [
            cloudflareTest({
                miniflare: {
                    compatibilityDate: '2026-08-04',
                    compatibilityFlags: ['nodejs_compat'],
                },
            }),
        ],
        resolve: { alias },
        test: {
            globals: true,
            include: ['src/**/*.test.ts'],
        },
    });
}
