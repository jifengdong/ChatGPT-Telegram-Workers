import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * 守卫 Workers 单文件产物的运行时可加载性。
 *
 * 该产物是纯 ESM,由 workerd 加载,而 workerd 不提供 `require`。一旦某个第三方
 * 依赖(历史上是 telegramify-markdown 的 `require('url')`)以 CJS 形式被打包,
 * 打包器会注入一个动态 require 垫片,构建仍然成功,但 Worker 启动即崩溃:
 *
 *     Uncaught Error: Dynamic require of "url" is not supported
 *
 * 这里断言产物中不存在该垫片,把「Workers 包零第三方运行时依赖」这一前提固定下来。
 */
const MARKER = "in an environment that doesn't expose the `require` function";

const bundle = path.resolve(import.meta.dirname, '../dist/index.js');
const source = fs.readFileSync(bundle, 'utf-8');

if (source.includes(MARKER)) {
    console.error(
        [
            `[check-bundle] ${path.relative(process.cwd(), bundle)} contains a CommonJS \`require\` shim.`,
            'The Workers single-file build must stay dependency-free ESM: a bundled CJS dependency',
            'is not loadable by workerd and will crash the Worker at startup.',
            'Remove or replace the offending dependency (see commit removing telegramify-markdown).',
        ].join('\n'),
    );
    process.exit(1);
}

console.log('[check-bundle] Workers bundle is dependency-free ESM.');
