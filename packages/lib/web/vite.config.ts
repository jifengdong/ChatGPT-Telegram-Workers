import { defineConfig } from 'vite';
import { htmlToString } from './plugin/export-html.js';

/**
 * 纯前端项目:入口是根目录的 index.html,页面按 pathname 路由到不同的 Web Component。
 * 构建时由 htmlToString 插件把 JS/CSS 内联成单个 HTML 字符串模块(dist/index.js),
 * 供 core 直接作为页面响应返回。
 *
 * 本地开发:`CTW_DEV_TARGET=https://your-deployment pnpm dev`,/rpc 会代理到该部署;
 * 不设置时页面可正常渲染,但数据接口不可用。
 */
const devTarget = process.env.CTW_DEV_TARGET;

export default defineConfig({
    plugins: [htmlToString()],
    server: devTarget ? { proxy: { '/rpc': { target: devTarget, changeOrigin: true } } } : undefined,
    build: {
        target: 'esnext',
        minify: 'esbuild',
    },
});
