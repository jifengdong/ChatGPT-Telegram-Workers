import { api, type BindResult } from '../shared/api';
import { html } from '../shared/dom';
import { icon } from '../shared/icons';

interface InitResult extends BindResult {}

/** 绑定结果页:调用 init.bind 并展示 Telegram 返回。 */
export class PageInit extends HTMLElement {
    connectedCallback(): void {
        this.render();
        this.querySelector('#retry')?.addEventListener('click', () => this.run());
        this.run();
    }

    private render(): void {
        this.replaceChildren(
            html(`
            <div class="contents">
            <header class="navbar">
                <a class="nav-left" href="/">${icon('chevron-left')}Home</a>
                <span class="nav-title">Bind Webhook</span>
            </header>
            <main>
                <section class="hero">
                    <div class="big-status" id="status-icon"><div class="spinner"></div></div>
                    <h1 id="status-title">Binding webhook…</h1>
                    <p class="muted" id="domain"></p>
                </section>

                <h2 class="section-h">Telegram response</h2>
                <div class="code-block" id="result" role="status"><pre>Contacting Telegram...</pre></div>

                <div class="btn-row">
                    <button type="button" class="btn" id="retry">${icon('refresh')}<span>Retry</span></button>
                </div>
            </main>
          </div>
        `),
        );
    }

    private showStatus(outcome: InitResult['outcome']): void {
        const box = this.querySelector('#status-icon');
        const title = this.querySelector('#status-title');
        if (!box || !title) {
            return;
        }
        if (outcome === 'no-token') {
            box.className = 'big-status err';
            box.replaceChildren(html(`${icon('warning')}`));
            title.textContent = 'TELEGRAM_TOKEN is not set';
            return;
        }
        const ok = outcome === 'ok';
        box.className = ok ? 'big-status ok' : 'big-status err';
        box.replaceChildren(html(ok ? icon('check-circle') : icon('x-circle')));
        title.textContent = ok ? 'Webhook bound successfully' : 'Binding finished with errors';
    }

    private setResult(text: string): void {
        this.querySelector('#result')?.replaceChildren(html(`<pre></pre>`));
        const pre = this.querySelector('#result pre');
        if (pre) {
            pre.textContent = text;
        }
    }

    private async run(): Promise<void> {
        const retry = this.querySelector<HTMLButtonElement>('#retry');
        const box = this.querySelector('#status-icon');
        const title = this.querySelector('#status-title');
        if (!retry || !box || !title) {
            return;
        }
        retry.disabled = true;
        box.className = 'big-status';
        box.replaceChildren(html('<div class="spinner"></div>'));
        title.textContent = 'Binding webhook…';
        this.setResult('Contacting Telegram...');
        try {
            const data = await api.bind();
            const domain = this.querySelector('#domain');
            if (domain) {
                domain.textContent = data.domain ?? location.host;
            }
            this.showStatus(data.tokenMissing ? 'no-token' : data.outcome);
            this.setResult(JSON.stringify(data.result ?? data, null, 2));
        } catch (e) {
            this.showStatus('error');
            const message = (e as Error).message || 'Failed to reach the server.';
            this.setResult(
                message.toLowerCase().includes('unauthorized')
                    ? 'Unauthorized. Open /admin, log in, then retry.'
                    : 'Failed to reach the server.',
            );
        } finally {
            retry.disabled = false;
        }
    }
}

customElements.define('page-init', PageInit);
