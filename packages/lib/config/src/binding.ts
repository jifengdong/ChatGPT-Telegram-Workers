/**
 * 平台绑定契约(Workers AI / KV / API 守卫)统一收敛在 @chatgpt-telegram-workers/types,
 * 这里再导出以保持本包原有的公开 API。
 */
export type { APIGuardBinding, KVNamespaceBinding, WorkersAIBinding } from '@chatgpt-telegram-workers/types';
