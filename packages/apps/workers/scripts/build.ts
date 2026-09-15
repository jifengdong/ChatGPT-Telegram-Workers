import * as path from 'node:path';
import { build } from 'esbuild';

/**
 * 把 Workers 入口打成单文件 ESM。
 *
 * 产物必须能被 workerd 直接加载:纯 ESM、无 `require` 垫片、不引用 node 内置模块。
 * 这些前提由紧随其后的 `check-bundle.ts` 断言。
 */
const root = path.resolve(import.meta.dirname, '..');

await build({
    entryPoints: [path.resolve(root, 'src/index.ts')],
    outfile: path.resolve(root, 'dist/index.js'),
    bundle: true,
    format: 'esm',
    target: 'esnext',
    // workerd 不是 node 也不是浏览器,按 Workers 的导出条件解析依赖
    platform: 'neutral',
    // neutral 平台必须显式声明 mainFields,否则连工作区包的 package.json#main 都不会被读取
    mainFields: ['module', 'main'],
    conditions: ['workerd', 'worker', 'browser', 'import', 'module', 'default'],
    sourcemap: true,
    logLevel: 'info',
});
