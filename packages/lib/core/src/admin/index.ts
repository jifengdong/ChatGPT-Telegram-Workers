import { PAGE_HTML } from '@chatgpt-telegram-workers/web';

export * from './api';
export * from './auth';
export { PAGE_HTML };
/** 兼容旧名称:单页 HTML 同时承载管理后台与其余页面。 */
export const ADMIN_HTML = PAGE_HTML;
