import { html } from '../shared/dom';
import { icon } from '../shared/icons';

export interface NavPushDetail {
    title: string;
    back: string;
    mount: (el: HTMLElement) => void;
    onClose?: () => void;
    /** pop 时向宿主派发 'pop' 事件,宿主据此做自动保存等收尾 */
    autosave?: boolean;
}

/**
 * iOS UINavigationController 风格的单层导航栈(web component):
 * - `push(detail)` 压入详情页(滑入转场),`pop()` 带转场返回,`popInstant()` 无动画返回;
 * - 返回按钮 / 侧滑 / 表单的 'close' 事件统一经 popstate 收尾,宿主无需自己管理 history;
 * - pop 完成后派发 'pop' 事件(detail 为原始 push detail),宿主监听它做自动保存等收尾;
 * - 宿主的根页面作为子元素放在组件内;push 时组件获得 pushed 类(全屏高度 + 底层页视差)。
 */
export class NavStack extends HTMLElement {
    private pushed_ = false;
    private pageEl: HTMLElement | null = null;
    private meta: NavPushDetail | null = null;

    get pushed(): boolean {
        return this.pushed_;
    }

    connectedCallback(): void {
        this.addEventListener('close', () => {
            // 详情页表单发起的关闭:走浏览器返回,统一由 popstate 收尾
            if (this.pushed_) {
                history.back();
            }
        });
        window.addEventListener('popstate', this.onPopState);
    }

    disconnectedCallback(): void {
        window.removeEventListener('popstate', this.onPopState);
    }

    private onPopState = (): void => {
        if (this.pushed_) {
            this.pop();
        }
    };

    push(detail: NavPushDetail): void {
        if (this.pushed_) {
            return;
        }
        const page = html(`
            <div class="push-page" role="dialog" aria-label="${detail.title}">
                <header class="navbar">
                    <button type="button" class="nav-left" data-back>${icon('chevron-left')}${detail.back}</button>
                    <span class="nav-title">${detail.title}</span>
                </header>
                <div class="push-content"></div>
            </div>
        `);
        this.pushed_ = true;
        this.pageEl = page;
        this.meta = detail;
        this.classList.add('pushed');
        this.appendChild(page);
        page.querySelector('[data-back]')?.addEventListener('click', () => history.back());
        detail.mount(page.querySelector('.push-content')!);
        // 双 rAF 确保初始 transform 已提交,触发过渡
        requestAnimationFrame(() => requestAnimationFrame(() => page.classList.add('open')));
        history.pushState({ ctwPush: true }, '');
    }

    pop(): void {
        if (!this.pushed_ || !this.pageEl) {
            return;
        }
        this.pushed_ = false;
        const page = this.pageEl;
        this.pageEl = null;
        const meta = this.meta;
        this.meta = null;
        this.classList.remove('pushed');
        page.classList.remove('open');
        page.classList.add('leaving');
        setTimeout(() => {
            page.remove();
            // onClose 先跑(页面可能丢弃未完成的草稿),宿主再在 pop 事件里做自动保存
            meta?.onClose?.();
            this.dispatchEvent(new CustomEvent('pop', { detail: meta }));
        }, 380);
    }

    /** 无动画立即关闭(切 tab / 保存后刷新时使用);不发 'pop' 事件,宿主自行收尾 */
    popInstant(): void {
        if (!this.pushed_) {
            return;
        }
        this.pushed_ = false;
        this.pageEl?.remove();
        this.pageEl = null;
        const meta = this.meta;
        this.meta = null;
        this.classList.remove('pushed');
        meta?.onClose?.();
        history.replaceState(null, '');
    }
}

customElements.define('nav-stack', NavStack);
