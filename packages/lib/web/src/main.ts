import './styles.css';
import './components/page-home';
import './components/page-help';
import './components/page-init';
import './components/page-interpolate';
import './components/admin-app';

/**
 * 页面路由:同一个自包含 HTML 由服务端按任意路径返回,
 * 前端根据 pathname 挂载对应的 Web Component。
 */
const ROUTES: Record<string, { tag: string; page: string }> = {
    '/': { tag: 'page-home', page: 'home' },
    '/help': { tag: 'page-help', page: 'help' },
    '/init': { tag: 'page-init', page: 'init' },
    '/interpolate': { tag: 'page-interpolate', page: 'interpolate' },
    '/admin': { tag: 'admin-app', page: 'admin' },
};

function mount(): void {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    const route = ROUTES[path] ?? ROUTES['/'];
    document.body.dataset.page = route.page;
    const app = document.getElementById('app');
    if (app) {
        app.replaceChildren(document.createElement(route.tag));
    }
}

mount();
