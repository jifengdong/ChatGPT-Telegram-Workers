import { rpcCall } from '../shared/rpc';
import { esc, html } from '../shared/dom';
import { icon } from '../shared/icons';

interface CommandDoc {
    command: string;
    description: string;
}

interface HomeInfo {
    domain: string;
    version: string;
    timestamp: string | number;
    adminUrl: string;
    initUrl: string;
    interpolateUrl: string;
    hasToken: boolean;
    commands: CommandDoc[];
    docsUrl?: string;
    issuesUrl?: string;
    repoUrl?: string;
}

/** 首页:部署状态 + 三步引导 + 命令与工具入口。 */
export class PageHome extends HTMLElement {
    connectedCallback(): void {
        this.render();
        this.load();
    }

    private render(): void {
        this.replaceChildren(
            html(`
            <div class="contents">
            <header class="navbar">
                <div class="nav-brand"><span class="nav-appicon">${icon('bot')}</span><strong>ChatGPT-Telegram-Workers</strong></div>
                <span class="nav-badge" id="version">…</span>
            </header>
            <main>
                <section class="hero">
                    <div class="app-icon">${icon('bot')}</div>
                    <div class="status-chip ok">${icon('check-circle')}Deployed successfully</div>
                    <p class="muted" id="meta"></p>
                    <div id="token-alert" style="width:100%"></div>
                </section>

                <h2 class="section-h">Getting started</h2>
                <section class="list-group">
                    <a class="list-row" id="admin-link" href="/admin">
                        <span class="row-icon" style="background:var(--blue)">${icon('gear')}</span>
                        <span class="row-main">
                            <span class="row-title">Configure your bot</span>
                            <span class="row-sub">Telegram token, AI providers and options</span>
                        </span>
                        ${icon('chevron-right')}
                    </a>
                    <a class="list-row" id="init-link" href="/init">
                        <span class="row-icon" style="background:var(--green)">${icon('link')}</span>
                        <span class="row-main">
                            <span class="row-title">Bind the webhook</span>
                            <span class="row-sub">Register with Telegram and publish commands</span>
                        </span>
                        ${icon('chevron-right')}
                    </a>
                    <a class="list-row" href="/help">
                        <span class="row-icon" style="background:var(--orange)">${icon('doc')}</span>
                        <span class="row-main">
                            <span class="row-title">Help &amp; commands</span>
                            <span class="row-sub">Quick start and bot command reference</span>
                        </span>
                        ${icon('chevron-right')}
                    </a>
                </section>

                <h2 class="section-h">Bot commands</h2>
                <section class="list-group" id="commands"></section>

                <h2 class="section-h">Tools</h2>
                <section class="list-group">
                    <a class="list-row" id="interpolate-link" href="/interpolate">
                        <span class="row-icon" style="background:var(--purple)">${icon('terminal')}</span>
                        <span class="row-main">
                            <span class="row-title">Template playground</span>
                            <span class="row-sub">Preview how plugin templates render with your data</span>
                        </span>
                        ${icon('chevron-right')}
                    </a>
                </section>

                <h2 class="section-h">Resources</h2>
                <section class="list-group">
                    <a class="list-row" id="docs-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master/doc" target="_blank" rel="noopener">
                        <span class="row-icon" style="background:var(--teal)">${icon('doc')}</span>
                        <span class="row-main"><span class="row-title">Documentation</span></span>
                        ${icon('external')}
                    </a>
                    <a class="list-row" id="repo-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers" target="_blank" rel="noopener">
                        <span class="row-icon" style="background:var(--text-3)">${icon('globe')}</span>
                        <span class="row-main"><span class="row-title">Source code</span></span>
                        ${icon('external')}
                    </a>
                    <a class="list-row" id="issues-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/issues" target="_blank" rel="noopener">
                        <span class="row-icon" style="background:var(--red)">${icon('warning')}</span>
                        <span class="row-main"><span class="row-title">Report an issue</span></span>
                        ${icon('external')}
                    </a>
                </section>

                <footer class="page-footer" id="build"></footer>
            </main>
          </div>
        `),
        );
    }

    private set(id: string, value: string): void {
        const el = this.querySelector<HTMLElement>(`#${id}`);
        if (el) {
            el.textContent = value;
        }
    }

    private link(id: string, href: string | undefined): void {
        const el = this.querySelector<HTMLAnchorElement>(`#${id}`);
        if (el && href) {
            el.href = href;
        }
    }

    private async load(): Promise<void> {
        try {
            const info = await rpcCall<HomeInfo>('pages.info');
            this.set('version', `v${info.version}`);
            this.set('meta', `${info.domain}`);
            this.set('build', `build ${info.timestamp}`);
            this.link('admin-link', info.adminUrl);
            this.link('init-link', info.initUrl);
            this.link('interpolate-link', info.interpolateUrl);
            this.link('docs-link', info.docsUrl);
            this.link('repo-link', info.repoUrl);
            this.link('issues-link', info.issuesUrl);
            if (!info.hasToken) {
                const alert = html(
                    `<div class="alert warn">${icon('warning')}<span>TELEGRAM_TOKEN is not set. Add it to your environment before binding the webhook.</span></div>`,
                );
                this.querySelector('#token-alert')?.replaceChildren(alert);
            }
            this.renderCommands(info.commands);
        } catch {
            this.set('meta', 'Failed to load page info.');
            this.renderCommands([]);
        }
    }

    private renderCommands(commands: CommandDoc[]): void {
        const list = this.querySelector('#commands');
        if (!list) {
            return;
        }
        if (!commands.length) {
            list.replaceChildren(
                html(
                    '<div class="list-row"><span class="row-main"><span class="row-sub">No commands available yet. Bind the webhook to publish them.</span></span></div>',
                ),
            );
            return;
        }
        list.replaceChildren(
            ...commands.map(({ command, description }) =>
                html(`<div class="list-row">
                        <span class="row-main">
                            <span class="row-title" style="font-family:var(--mono);font-size:15px;color:var(--blue)">${esc(command)}</span>
                            ${description ? `<span class="row-sub">${esc(description)}</span>` : ''}
                        </span>
                    </div>`),
            ),
        );
    }
}

customElements.define('page-home', PageHome);
