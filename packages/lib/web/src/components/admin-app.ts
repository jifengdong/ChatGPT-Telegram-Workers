import type { MaskedConfig, Meta } from '../shared/types';
import { api, setToken } from '../shared/api';
import { html, toast } from '../shared/dom';
import { icon } from '../shared/icons';
import type { NavPushDetail, NavStack } from './nav-stack';
import './admin-login';
import './nav-stack';
import './settings-form';
import './provider-page';
import './list-pages';

type Tab = 'providers' | 'image' | 'settings' | 'plugins' | 'commands';

/**
 * 移动端原生 App 形态:底部标签栏 + 各 tab 独立页面 + push 详情页。
 * 桌面端呈现为居中手机列宽(640px)。
 */
const TABS: { id: Tab; label: string; title: string; icon: string; tint: string }[] = [
    { id: 'providers', label: 'Chat', title: 'Chat Providers', icon: 'bot', tint: 'var(--blue)' },
    { id: 'image', label: 'Image', title: 'Image Providers', icon: 'image', tint: 'var(--purple)' },
    { id: 'settings', label: 'Settings', title: 'Settings', icon: 'gear', tint: 'var(--text-3)' },
    { id: 'plugins', label: 'Plugins', title: 'Plugins', icon: 'puzzle', tint: 'var(--orange)' },
    { id: 'commands', label: 'Commands', title: 'Custom Commands', icon: 'terminal', tint: 'var(--green)' },
];

/** 根组件:登录态 + 标签栏 + 导航栈(nav-stack)+ 保存 */
export class AdminApp extends HTMLElement {
    private config: MaskedConfig | null = null;
    private meta: Meta | null = null;
    private agents: { chat: any; image: any } | null = null;
    private info: { version: string; timestamp: number } | null = null;
    private tab: Tab = 'providers';
    private pages: Partial<Record<Tab, any>> = {};
    private nav: NavStack | null = null;

    connectedCallback(): void {
        // 不用 once:登录→登出→再登录会触发多次,load() 幂等
        this.addEventListener('logged-in', () => this.load());
        // 子页面通过 'push' 事件请求导航;'close' 事件由 nav-stack 内部接管
        this.addEventListener('push', e => {
            this.nav?.push((e as CustomEvent<NavPushDetail>).detail);
            this.updateFab();
        });
        this.renderLoginGate();
    }

    private renderLoginGate(): void {
        this.replaceChildren(html('<admin-login></admin-login>'));
    }

    private async load(): Promise<void> {
        try {
            [this.meta, this.config, this.agents, this.info] = await Promise.all([
                api.meta(),
                api.getConfig(),
                api.agents().catch(() => ({ chat: null, image: null })),
                api.pageInfo().catch(() => null),
            ]);
            this.renderShell();
        } catch (e) {
            toast((e as Error).message, true);
            setToken(null);
            this.renderLoginGate();
        }
    }

    private pageEl(tab: Tab): HTMLElement | null {
        return this.querySelector<HTMLElement>(`.page-root[data-tab="${tab}"]`);
    }

    private renderShell(): void {
        if (!this.config || !this.meta) {
            return;
        }
        const root = html(`
            <div class="admin-app">
                <nav-stack>
                    ${TABS.map(t => `<div class="page-root" data-tab="${t.id}" hidden></div>`).join('')}
                </nav-stack>
                <button type="button" class="save-fab" data-save>Save</button>
                <nav class="tabbar" role="tablist" aria-label="Admin sections">
                    ${TABS.map(
                        t => `<button type="button" role="tab" class="tab-btn" data-tab="${t.id}" aria-selected="${t.id === this.tab}">
                            ${icon(t.icon)}<span>${t.label}</span>
                        </button>`,
                    ).join('')}
                </nav>
            </div>
        `);
        root.querySelectorAll<HTMLButtonElement>('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab as Tab));
        });
        root.querySelector('[data-save]')?.addEventListener('click', () => this.save());
        this.nav = root.querySelector('nav-stack');
        this.nav?.addEventListener('pop', e => {
            // nav-stack 在 onClose(可能丢弃空草稿)之后派发 pop,这里做自动保存收尾
            const detail = (e as CustomEvent<NavPushDetail>).detail;
            if (detail?.autosave) {
                this.collect();
                void this.persist();
            }
            this.updateFab();
        });
        this.replaceChildren(root);
        this.pages = {};
        for (const t of TABS) {
            this.renderTab(t.id);
        }
        this.activateTab(this.tab);
    }

    private renderTab(tab: Tab): void {
        const config = this.config!;
        const meta = this.meta!;
        const host = this.pageEl(tab);
        const t = TABS.find(x => x.id === tab)!;
        if (!host) {
            return;
        }
        const shell = html(`
            <div>
                <header class="navbar">
                    <div class="nav-brand"><span class="nav-appicon" style="background:${t.tint}">${icon(t.icon)}</span><strong>${t.title}</strong></div>
                </header>
            </div>
        `);
        let page: any;
        if (tab === 'providers' || tab === 'image') {
            const isChat = tab === 'providers';
            page = document.createElement('provider-page') as any;
            page.configure(
                isChat ? 'chat' : 'image',
                isChat ? meta.chatProtocols : meta.imageProtocols,
                isChat ? config.chatProviders : config.imageProviders,
                isChat ? config.defaultChatProvider : config.defaultImageProvider,
                meta.workersBinding,
            );
        } else if (tab === 'settings') {
            page = document.createElement('settings-form') as any;
            page.value = config.settings;
            page.about = {
                version: this.info
                    ? `${this.info.version} (${new Date(this.info.timestamp * 1000).toISOString().slice(0, 10)})`
                    : null,
                chat: this.agents?.chat ?? null,
                image: this.agents?.image ?? null,
            };
        } else if (tab === 'plugins') {
            page = document.createElement('plugins-page') as any;
            page.value = config.plugins;
        } else {
            page = document.createElement('commands-page') as any;
            page.value = config.customCommands;
        }
        this.pages[tab] = page;
        shell.append(page);
        host.replaceChildren(shell);
    }

    private activateTab(tab: Tab): void {
        for (const t of TABS) {
            this.pageEl(t.id)?.toggleAttribute('hidden', t.id !== tab);
        }
        this.querySelectorAll('.tab-btn').forEach(btn => {
            btn.setAttribute('aria-selected', String((btn as HTMLElement).dataset.tab === tab));
            btn.classList.toggle('active', (btn as HTMLElement).dataset.tab === tab);
        });
        this.updateFab();
    }

    private switchTab(tab: Tab): void {
        if (tab === this.tab) {
            return;
        }
        // 先关闭详情页(其 onClose 会丢弃空草稿),再收集,避免脏数据进配置
        if (this.nav?.pushed) {
            this.nav.popInstant();
        }
        this.collect();
        this.tab = tab;
        this.activateTab(tab);
    }

    /** 把各页面组件的编辑结果收集回 config */
    private collect(): void {
        if (!this.config) {
            return;
        }
        const providerChat = this.pages.providers;
        if (providerChat) {
            const { providers, defaultId } = providerChat.value;
            this.config.chatProviders = providers;
            this.config.defaultChatProvider = defaultId;
        }
        const providerImage = this.pages.image;
        if (providerImage) {
            const { providers, defaultId } = providerImage.value;
            this.config.imageProviders = providers;
            this.config.defaultImageProvider = defaultId;
        }
        if (this.pages.settings) {
            this.config.settings = this.pages.settings.value;
        }
        if (this.pages.plugins) {
            this.config.plugins = this.pages.plugins.value;
        }
        if (this.pages.commands) {
            this.config.customCommands = this.pages.commands.value;
        }
    }

    private async save(): Promise<void> {
        const buttons = [...this.querySelectorAll<HTMLButtonElement>('[data-save]')];
        if (buttons.some(b => b.disabled)) {
            return;
        }
        this.collect();
        buttons.forEach(b => {
            b.disabled = true;
            b.textContent = 'Saving…';
        });
        try {
            await this.persist();
            if (this.nav?.pushed) {
                this.nav.popInstant();
            }
            await this.load();
        } catch (e) {
            toast((e as Error).message, true);
        } finally {
            buttons.forEach(b => {
                b.disabled = false;
                b.textContent = 'Save';
            });
        }
    }

    /** 静默保存当前配置(自动保存路径):成功/失败都用 toast 提示,不刷新页面 */
    private async persist(): Promise<void> {
        try {
            await api.saveConfig(this.config!);
            toast('Saved');
        } catch (e) {
            toast((e as Error).message, true);
        }
    }

    /** 悬浮保存按钮只在 Settings 页(行内编辑)与详情页出现;列表页没有未保存的入口 */
    private updateFab(): void {
        const fab = this.querySelector('.save-fab');
        if (fab) {
            (fab as HTMLElement).style.display = this.tab === 'settings' || (this.nav?.pushed ?? false) ? '' : 'none';
        }
    }
}

customElements.define('admin-app', AdminApp);
