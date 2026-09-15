/**
 * `@chatgpt-telegram-workers/web` 的公开类型面。
 *
 * 该包的实际产物是构建期由 `plugin/export-html.ts` 把管理页 HTML 内联成的单个字符串模块
 * (`dist/index.js`),其内容无法在类型层面表达 —— 对外契约就是「一个 HTML 字符串」。
 * 把声明固化在这里(而不是等构建产出 `dist/index.d.ts`),让 `tsc` 类型检查不依赖构建顺序。
 */
export declare const PAGE_HTML: string;
export default PAGE_HTML;
