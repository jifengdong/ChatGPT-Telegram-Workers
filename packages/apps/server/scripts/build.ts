import * as fs from 'node:fs';
import * as path from 'node:path';
import { build } from 'esbuild';

/**
 * 把 server 的两个入口打成自包含 ESM:`node.js`(本地/Docker)与 `vercel.js`。
 *
 * 工作区内的包(`@chatgpt-telegram-workers/*`)会被内联,第三方依赖保持 external ——
 * 与 `package-docker.json`(由 docker-package.ts 生成)声明的一致,运行时由 node_modules 提供。
 */
const root = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.resolve(root, 'package.json'), 'utf-8')) as {
    dependencies?: Record<string, string>;
};

const external = Object.keys(pkg.dependencies ?? {}).filter(name => !name.startsWith('@chatgpt-telegram-workers/'));

await build({
    entryPoints: {
        node: path.resolve(root, 'src/node.ts'),
        vercel: path.resolve(root, 'src/vercel.ts'),
    },
    outdir: path.resolve(root, 'dist'),
    bundle: true,
    format: 'esm',
    target: 'esnext',
    platform: 'node',
    // 两个入口各自独立,不生成共享 chunk(否则 node.js 无法单独运行)
    splitting: false,
    external,
    sourcemap: true,
    logLevel: 'info',
});
