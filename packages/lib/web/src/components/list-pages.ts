import { armConfirm, esc, html, uid } from '../shared/dom';
import { icon } from '../shared/icons';

const SCOPES: { id: string; label: string }[] = [
    { id: 'all_private_chats', label: 'Private Chats' },
    { id: 'all_group_chats', label: 'Group Chats' },
    { id: 'all_chat_administrators', label: 'Chat Administrators' },
];

function tintOf(index: number, kind: 'plugin' | 'custom'): string {
    if (kind === 'plugin') {
        return 'var(--orange)';
    }
    const palette = ['var(--green)', 'var(--teal)', 'var(--blue)', 'var(--purple)'];
    return palette[index % palette.length];
}

/** 插件/自定义命令共用详情编辑页 */
class ItemForm extends HTMLElement {
    private kind: 'plugin' | 'custom' = 'plugin';
    private item: any;
    private opts!: { onRemove: () => void };

    open(kind: 'plugin' | 'custom', item: any, opts: { onRemove: () => void }): void {
        this.kind = kind;
        this.item = item;
        this.opts = opts;
        this.render();
    }

    private close(): void {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    private render(): void {
        const item = this.item;
        const scopeRows = SCOPES.map(
            s => `
            <label class="list-row">
                <span class="row-main"><span class="row-title">${s.label}</span><span class="row-sub">${s.id}</span></span>
                <input type="checkbox" class="switch" data-scope="${s.id}" ${item.scope.includes(s.id) ? 'checked' : ''} aria-label="${s.label}" />
            </label>`,
        ).join('');
        const contentLabel = this.kind === 'plugin' ? 'Template' : 'Value';
        const contentPlaceholder =
            this.kind === 'plugin' ? 'JSON or remote URL' : '/setenvs {"defaultChatProvider":"openai"} or any text';
        const contentSub =
            this.kind === 'plugin'
                ? 'JSON template or remote URL. The rendered result is sent as the reply'
                : 'Values starting with /setenv, /setenvs, /delenv or JSON are applied as a config patch (admin only); anything else expands as a text alias';
        const contentValue = this.kind === 'plugin' ? item.template : item.value;
        const envSection =
            this.kind === 'plugin'
                ? `<h2 class="section-h">Environment</h2>
                   <section class="list-group">
                       <div class="row-stack">
                           <span class="row-label">JSON key-value pairs, available when rendering the template</span>
                           <textarea class="bare code" data-env placeholder='{"KEY":"value"}' spellcheck="false">${esc(
                               JSON.stringify(item.env || {}, null, 2),
                           )}</textarea>
                       </div>
                   </section>`
                : '';
        this.replaceChildren(
            html(`
            <main>
                <h2 class="section-h">Command</h2>
                <section class="list-group">
                    <div class="row-field">
                        <span class="row-label">Command</span>
                        <input class="bare mono" data-field="command" value="${esc(item.command)}" placeholder="/command" aria-label="Command" />
                    </div>
                    <div class="row-field">
                        <span class="row-label">Description</span>
                        <input class="bare" data-field="description" value="${esc(item.description)}" placeholder="What it does" aria-label="Description" />
                    </div>
                    <label class="list-row">
                        <span class="row-main"><span class="row-title">Enabled</span></span>
                        <input type="checkbox" class="switch" data-field-enabled ${item.enabled ? 'checked' : ''} aria-label="Enabled" />
                    </label>
                </section>

                <h2 class="section-h">Scope</h2>
                <section class="list-group">${scopeRows}</section>
                <p class="group-footer">Choose which chats expose the command. It is also registered in the Telegram command menu.</p>

                <h2 class="section-h">${contentLabel}</h2>
                <section class="list-group">
                    <div class="row-stack">
                        <span class="row-label">${contentSub}</span>
                        <textarea class="bare code" data-field-content placeholder="${esc(contentPlaceholder)}" spellcheck="false">${esc(contentValue)}</textarea>
                    </div>
                </section>
                ${envSection}

                <section class="list-group">
                    <button type="button" class="list-row destructive" data-remove>Delete Command</button>
                </section>
            </main>
        `),
        );
        this.bind();
    }

    private bind(): void {
        const item = this.item;
        this.querySelector<HTMLInputElement>('[data-field="command"]')?.addEventListener('input', e => {
            item.command = (e.target as HTMLInputElement).value;
        });
        this.querySelector<HTMLInputElement>('[data-field="description"]')?.addEventListener('input', e => {
            item.description = (e.target as HTMLInputElement).value;
        });
        this.querySelector<HTMLInputElement>('[data-field-enabled]')?.addEventListener('change', e => {
            item.enabled = (e.target as HTMLInputElement).checked;
        });
        this.querySelectorAll<HTMLInputElement>('[data-scope]').forEach(input => {
            input.addEventListener('change', () => {
                const id = input.dataset.scope!;
                if (input.checked && !item.scope.includes(id)) {
                    item.scope.push(id);
                } else if (!input.checked) {
                    item.scope = item.scope.filter((s: string) => s !== id);
                }
            });
        });
        this.querySelector<HTMLTextAreaElement>('[data-field-content]')?.addEventListener('input', e => {
            if (this.kind === 'plugin') {
                item.template = (e.target as HTMLTextAreaElement).value;
            } else {
                item.value = (e.target as HTMLTextAreaElement).value;
            }
        });
        this.querySelector<HTMLTextAreaElement>('[data-env]')?.addEventListener('input', e => {
            try {
                item.env = JSON.parse((e.target as HTMLTextAreaElement).value || '{}');
            } catch {
                /* allow invalid while typing */
            }
        });
        const removeBtn = this.querySelector<HTMLButtonElement>('[data-remove]');
        removeBtn?.addEventListener('click', () =>
            armConfirm(
                removeBtn,
                () => {
                    this.opts.onRemove();
                    this.close();
                },
                'Tap again to delete',
            ),
        );
    }
}

customElements.define('item-form', ItemForm);

/** 列表页基类:插件命令 / 自定义命令 共用 */
class ItemListPage extends HTMLElement {
    protected kind: 'plugin' | 'custom' = 'plugin';
    protected items: any[] = [];

    set value(items: any[]) {
        this.items = items.map(i => ({ ...i, scope: [...(i.scope || [])], env: { ...i.env } }));
        this.render();
    }

    get value(): any[] {
        return this.items;
    }

    protected get addLabel(): string {
        return this.kind === 'plugin' ? 'Add Plugin' : 'Add Command';
    }

    protected get backLabel(): string {
        return this.kind === 'plugin' ? 'Plugins' : 'Commands';
    }

    protected blank(): any {
        if (this.kind === 'plugin') {
            return {
                id: uid('plugin'),
                command: '/',
                description: '',
                scope: [],
                template: '',
                env: {},
                enabled: true,
            };
        }
        return {
            id: uid('custom'),
            command: '/',
            description: '',
            scope: [],
            value: '',
            enabled: true,
        };
    }

    protected render(): void {
        const rows = this.items
            .map(
                (item, i) => `
                <button type="button" class="list-row" data-edit="${esc(item.id)}">
                    <span class="row-icon" style="background:${tintOf(i, this.kind)}">${icon(this.kind === 'plugin' ? 'puzzle' : 'terminal')}</span>
                    <span class="row-main">
                        <span class="row-title" style="font-family:var(--mono);font-size:15px">${esc(item.command || '/')}</span>
                        <span class="row-sub">${esc(item.description || (item.enabled ? 'Enabled' : 'Disabled'))}</span>
                    </span>
                    ${item.enabled ? '' : `<span class="row-value">Off</span>`}
                    ${icon('chevron-right')}
                </button>`,
            )
            .join('');
        const empty = this.items.length
            ? ''
            : `<div class="list-row"><span class="row-main"><span class="row-sub">${
                  this.kind === 'plugin' ? 'No plugin commands yet.' : 'No custom commands yet.'
              }</span></span></div>`;
        this.replaceChildren(
            html(`
            <main>
                <section class="list-group">
                    <button type="button" class="list-row" data-add>
                        <span class="row-icon" style="background:var(--green)">${icon('plus')}</span>
                        <span class="row-main"><span class="row-title">${this.addLabel}</span></span>
                    </button>
                </section>
                <section class="list-group">${empty}${rows}</section>
            </main>
        `),
        );
        this.querySelector('[data-add]')?.addEventListener('click', () => {
            const item = this.blank();
            this.items.push(item);
            this.openForm(item);
        });
        this.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = this.items.find(x => x.id === btn.dataset.edit);
                if (item) {
                    this.openForm(item);
                }
            });
        });
    }

    protected openForm(item: any): void {
        this.dispatchEvent(
            new CustomEvent('push', {
                bubbles: true,
                composed: true,
                detail: {
                    title: item.command || this.addLabel,
                    back: this.backLabel,
                    onClose: () => this.render(),
                    autosave: true,
                    mount: (el: HTMLElement) => {
                        const form = document.createElement('item-form') as any;
                        form.open(this.kind, item, {
                            onRemove: () => {
                                this.items = this.items.filter(x => x.id !== item.id);
                            },
                        });
                        el.replaceChildren(form);
                    },
                },
            }),
        );
    }
}

/** 插件命令列表页 */
export class PluginsPage extends ItemListPage {
    protected kind: 'plugin' | 'custom' = 'plugin';
}

customElements.define('plugins-page', PluginsPage);

/** 自定义命令列表页 */
export class CommandsPage extends ItemListPage {
    protected kind: 'plugin' | 'custom' = 'custom';
}

customElements.define('commands-page', CommandsPage);
