/** 极简 DOM 辅助:html 模板、转义、toast、唯一 id。 */

/** 由 HTML 字符串创建元素(取第一个子节点) */
export function html(markup: string): HTMLElement {
    const tpl = document.createElement('template');
    tpl.innerHTML = markup.trim();
    return tpl.content.firstElementChild as HTMLElement;
}

/** 由 HTML 字符串创建文档片段(保留同级多个节点) */
export function fragment(markup: string): DocumentFragment {
    const tpl = document.createElement('template');
    tpl.innerHTML = markup.trim();
    return tpl.content;
}

export function esc(value: unknown): string {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

let toastTimer: ReturnType<typeof setTimeout> | undefined;

export function toast(message: string, isError = false): void {
    let el = document.querySelector<HTMLElement>('.toast');
    if (!el) {
        el = document.createElement('div');
        el.className = 'toast';
        el.setAttribute('role', 'status');
        el.setAttribute('aria-live', 'polite');
        document.body.appendChild(el);
    }
    el.classList.toggle('error', isError);
    el.textContent = message;
    // 先移除再添加,保证连续 toast 也能重新触发过渡
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el?.classList.remove('show'), 2200);
}

export function uid(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * 危险操作的二段确认:首次点击进入待确认态(换文案、标红),
 * timeout 内再次点击才执行;超时或失焦自动复原。适配拇指误触。
 */
export function armConfirm(
    button: HTMLButtonElement,
    action: () => void,
    confirmLabel = 'Tap again to confirm',
    timeout = 3000,
): void {
    if (button.dataset.armed === '1') {
        button.dataset.armed = '';
        button.classList.remove('armed');
        action();
        return;
    }
    const original = button.innerHTML;
    button.dataset.armed = '1';
    button.classList.add('armed');
    button.textContent = confirmLabel;
    const reset = () => {
        if (button.dataset.armed === '1') {
            button.dataset.armed = '';
            button.classList.remove('armed');
            button.innerHTML = original;
            button.removeEventListener('focusout', reset);
        }
    };
    setTimeout(reset, timeout);
    button.addEventListener('focusout', reset);
}
