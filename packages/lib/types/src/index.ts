import type { Ai, AiModelsSearchObject, AiModelsSearchParams } from '@cloudflare/workers-types';

/**
 * 跨包共享的平台类型:Cloudflare Workers 运行时类型 + 各运行时都要实现的绑定契约。
 *
 * 这里以模块化 `import type` / `re-export` 的方式只暴露仓库实际用到的成员,
 * 而不是把 `@cloudflare/workers-types` 整体作为全局类型环境引入(即不写进 tsconfig
 * 的 `types` 数组)。后者会把 workerd 自己的 `console` / `crypto` / `Blob` / `Request`
 * 等声明注入全局,与 Node、DOM 的同名全局冲突,并让非 Workers 包也误以为运行在 workerd 上。
 * 模块化引用时这些类型只在显式 import 处可见,不进入全局作用域。
 */

/** Workers AI 绑定(`env.AI`)及其模型检索类型,直接取自官方定义以保证与 Cloudflare 对齐 */
export type { Ai, AiModelsSearchObject, AiModelsSearchParams };

/**
 * `models()` 返回的条目。字段取自官方 `AiModelsSearchObject`(来源变更会在编译期暴露),
 * 但整体保持宽松:绑定与账号级 REST 搜索共用此形状,后者是不受信任的 JSON,
 * 因此字段可选、`task` 不做收窄,由解析方按运行时形状判断。
 */
export type WorkersAIModelInfo = Partial<Pick<AiModelsSearchObject, 'id' | 'name'>> & { task?: unknown };

/**
 * Workers AI 绑定:以官方 `Ai` 为基础,只取实际用到的成员。
 * `models` 保持可选(老运行时可能没有该方法,缺失时回退到账户级 REST 列表)。
 * 官方 `Ai` 满足此类型,由 ai 包的编译期断言守护。
 */
export type WorkersAIBinding = Pick<Ai, 'run'> & {
    models?(params?: AiModelsSearchParams): Promise<WorkersAIModelInfo[]>;
};

/**
 * KV 绑定:只声明本仓库实际用到的成员,便于 Node 侧用内存实现替换。
 */
export interface KVNamespaceBinding {
    get: (key: string) => Promise<string | any>;
    put: (key: string, value: string, info?: { expirationTtl?: number; expiration?: number }) => Promise<void>;
    delete: (key: string) => Promise<void>;
}

/** API 访问守卫绑定(限流/鉴权等前置 fetch) */
export interface APIGuardBinding {
    fetch: (request: Request) => Promise<Response>;
}
