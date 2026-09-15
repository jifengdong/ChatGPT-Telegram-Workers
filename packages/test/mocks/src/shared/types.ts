/**
 * 测试 mock 的公共类型。所有 mock 都以 `fetch(Request) => Response` 为核心,
 * 因此同一套逻辑既能跑在 node(http 适配器)也能跑在 workerd。
 */

/** 记录到的一次入站调用(Telegram 方法或 LLM 路径) */
export interface RecordedCall<Body = any> {
    /** Telegram: 方法名(路径末段); LLM: 请求路径 */
    method: string;
    /** 完整请求路径(含查询串) */
    path: string;
    /** 解析后的请求体(JSON 对象,或 multipart 的字段映射) */
    body: Body;
    /** 携带该请求的 token(Telegram 路径参数) */
    token: string;
    /** 请求头(小写键),便于断言 Authorization 等 */
    headers?: Record<string, string>;
    /** mock 实际返回的 HTTP 状态码 */
    status: number;
}

/** 一次性/持续性的错误注入 */
export interface ErrorInjection {
    /** 目标方法名,`*` 表示所有方法 */
    method: string;
    /** HTTP 状态码,默认 400(Telegram 错误通常为 400/429/500) */
    status?: number;
    /** 响应体 error_code,默认与 status 相同 */
    errorCode?: number;
    /** 人类可读描述,默认 `Mock error for <method>` */
    description?: string;
    /** 若设置,写入 `Retry-After` 响应头(秒) */
    retryAfter?: number;
    /** 生效次数,默认 1;`Infinity` 表示一直生效 */
    times?: number;
    /** 额外条件;返回 false 时本次不消耗注入 */
    when?: (call: RecordedCall) => boolean;
}

/** 通用「按方法分派」的响应覆盖 */
export type MethodHandler = (call: RecordedCall) => unknown | Promise<unknown>;
