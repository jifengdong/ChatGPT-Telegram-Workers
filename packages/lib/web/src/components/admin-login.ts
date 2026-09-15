import { api, setToken } from '../shared/api';
import { html, toast } from '../shared/dom';
import { icon } from '../shared/icons';
import { getTelegramInitData, telegramWebAppReady } from '../shared/telegram';

declare global {
    interface Window {
        Telegram?: { WebApp?: { initData?: string; ready?: () => void; expand?: () => void } };
    }
}

/** 登录:自动尝试 TMA initData,失败回退密码。 */
export class AdminLogin extends HTMLElement {
    connectedCallback(): void {
        this.replaceChildren(
            html(`
            <div class="contents">
            <header class="navbar">
                <div class="nav-brand"><span class="nav-appicon">${icon('bot')}</span><strong>Admin</strong></div>
            </header>
            <main>
                <section class="hero">
                    <div class="app-icon" style="background:var(--blue)"><div class="spinner"></div></div>
                    <h1>Checking…</h1>
                    <p class="muted">Verifying authorization.</p>
                </section>
            </main>
            </div>`),
        );
        this.attempt();
    }

    private async attempt(): Promise<void> {
        telegramWebAppReady();
        const initData = getTelegramInitData();
        if (initData) {
            try {
                const { token } = await api.loginInitData(initData);
                setToken(token);
                this.dispatchEvent(new CustomEvent('logged-in', { bubbles: true }));
                return;
            } catch (e) {
                toast(`TMA login failed: ${(e as Error).message}`, true);
            }
        }
        let info = { passwordEnabled: false, hasToken: false };
        try {
            info = (await api.authInfo()) ?? info;
        } catch {
            /* ignore */
        }
        this.renderPassword(info.passwordEnabled);
    }

    private renderPassword(passwordEnabled: boolean): void {
        if (!passwordEnabled) {
            this.replaceChildren(
                html(`
                <div class="contents">
                <header class="navbar">
                    <div class="nav-brand"><span class="nav-appicon">${icon('bot')}</span><strong>Admin</strong></div>
                </header>
                <main>
                    <section class="hero">
                        <div class="app-icon" style="background:var(--red)">${icon('lock')}</div>
                        <h1>Cannot sign in</h1>
                        <p class="muted">Opened outside the Telegram Mini App and ADMIN_PASSWORD is not set.</p>
                    </section>
                </main>
            </div>`),
            );
            return;
        }
        this.replaceChildren(
            html(`
            <div class="contents">
            <header class="navbar">
                <div class="nav-brand"><span class="nav-appicon">${icon('bot')}</span><strong>Admin</strong></div>
            </header>
            <main>
                <section class="hero">
                    <div class="app-icon">${icon('lock')}</div>
                    <h1>Admin</h1>
                    <p class="muted">Enter the administrator password to continue.</p>
                </section>
                <section class="list-group">
                    <div class="list-row">
                        <input class="bare" style="text-align:left" type="password" id="pwd" placeholder="Password"
                            autocomplete="current-password" aria-label="Password" />
                    </div>
                </section>
                <div class="btn-row"><button type="button" class="btn" id="login">Log In</button></div>
            </main>
            </div>`),
        );
        const doLogin = async () => {
            const pwd = this.querySelector<HTMLInputElement>('#pwd')!.value;
            const btn = this.querySelector<HTMLButtonElement>('#login')!;
            if (btn.disabled) {
                return;
            }
            btn.disabled = true;
            btn.textContent = 'Logging In…';
            try {
                const { token } = await api.loginPassword(pwd);
                setToken(token);
                this.dispatchEvent(new CustomEvent('logged-in', { bubbles: true }));
            } catch (e) {
                toast((e as Error).message, true);
                btn.disabled = false;
                btn.textContent = 'Log In';
            }
        };
        this.querySelector('#login')?.addEventListener('click', doLogin);
        this.querySelector('#pwd')?.addEventListener('keydown', e => {
            if ((e as KeyboardEvent).key === 'Enter') {
                doLogin();
            }
        });
    }
}

customElements.define('admin-login', AdminLogin);
