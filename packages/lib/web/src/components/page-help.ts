import { rpcCall } from '../shared/rpc';
import { esc, html } from '../shared/dom';
import { icon } from '../shared/icons';

interface CommandDoc {
    command: string;
    description: string;
}

interface HelpInfo {
    commands: CommandDoc[];
    docsUrl?: string;
    issuesUrl?: string;
    repoUrl?: string;
    adminUrl?: string;
}

const STEPS: { title: string; sub: string; color: string; icon: string }[] = [
    {
        title: 'Configure the bot',
        sub: 'Set TELEGRAM_TOKEN and your AI provider API keys in the environment, or manage them later in the admin panel.',
        color: 'var(--blue)',
        icon: 'gear',
    },
    {
        title: 'Bind the webhook',
        sub: 'Open the bind page to register this deployment with Telegram and publish the bot commands.',
        color: 'var(--green)',
        icon: 'link',
    },
    {
        title: 'Start chatting',
        sub: 'Find your bot in Telegram and send a message. Use /help in chat to list everything it can do.',
        color: 'var(--orange)',
        icon: 'bot',
    },
];

/** 帮助页:快速上手 + 命令参考 + 资源链接。 */
export class PageHelp extends HTMLElement {
    connectedCallback(): void {
        this.render();
        this.load();
    }

    private render(): void {
        this.replaceChildren(
            html(`
            <div class="contents">
            <header class="navbar">
                <a class="nav-left" href="/">${icon('chevron-left')}Home</a>
                <span class="nav-title">Help</span>
            </header>
            <main>
                <section class="hero" style="padding-bottom:8px">
                    <div class="app-icon">${icon('doc')}</div>
                    <h1>Help</h1>
                    <p class="muted">Everything you need to run and use your bot.</p>
                </section>

                <h2 class="section-h">Quick start</h2>
                <section class="list-group">
                    ${STEPS.map(
                        (s, i) => `
                        <div class="list-row">
                            <span class="row-num">${i + 1}</span>
                            <span class="row-main">
                                <span class="row-title">${s.title}</span>
                                <span class="row-sub">${s.sub}</span>
                            </span>
                        </div>`,
                    ).join('')}
                </section>

                <h2 class="section-h">Bot commands</h2>
                <section class="list-group" id="commands"></section>

                <h2 class="section-h">Resources</h2>
                <section class="list-group">
                    <a class="list-row" id="admin-link" href="/admin">
                        <span class="row-icon" style="background:var(--blue)">${icon('gear')}</span>
                        <span class="row-main"><span class="row-title">Admin panel</span><span class="row-sub">Providers, settings, plugins</span></span>
                        ${icon('chevron-right')}
                    </a>
                    <a class="list-row" id="interpolate-link" href="/interpolate">
                        <span class="row-icon" style="background:var(--purple)">${icon('terminal')}</span>
                        <span class="row-main"><span class="row-title">Template playground</span><span class="row-sub">Test plugin templates</span></span>
                        ${icon('chevron-right')}
                    </a>
                    <a class="list-row" id="docs-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master/doc" target="_blank" rel="noopener">
                        <span class="row-icon" style="background:var(--teal)">${icon('doc')}</span>
                        <span class="row-main"><span class="row-title">Documentation</span></span>
                        ${icon('external')}
                    </a>
                    <a class="list-row" id="issues-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/issues" target="_blank" rel="noopener">
                        <span class="row-icon" style="background:var(--red)">${icon('warning')}</span>
                        <span class="row-main"><span class="row-title">Report an issue</span></span>
                        ${icon('external')}
                    </a>
                </section>

                <footer class="page-footer">ChatGPT-Telegram-Workers</footer>
            </main>
          </div>
        `),
        );
    }

    private async load(): Promise<void> {
        let info: HelpInfo;
        try {
            info = await rpcCall<HelpInfo>('pages.info');
        } catch {
            this.renderCommands([]);
            return;
        }
        this.link('admin-link', info.adminUrl);
        this.link('interpolate-link', (info as unknown as { interpolateUrl?: string }).interpolateUrl);
        this.link('docs-link', info.docsUrl);
        this.link('issues-link', info.issuesUrl);
        this.link('repo-link', info.repoUrl);
        this.renderCommands(info.commands ?? []);
    }

    private renderCommands(commands: CommandDoc[]): void {
        const list = this.querySelector('#commands');
        if (!list) {
            return;
        }
        if (!commands.length) {
            list.replaceChildren(
                html(
                    '<div class="list-row"><span class="row-main"><span class="row-sub">No commands available yet.</span></span></div>',
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

    private link(id: string, href: string | undefined): void {
        const el = this.querySelector<HTMLAnchorElement>(`#${id}`);
        if (el && href) {
            el.href = href;
        }
    }
}

customElements.define('page-help', PageHelp);
