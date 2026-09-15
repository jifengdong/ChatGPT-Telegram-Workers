import type { MaskedProvider, ProtocolOption } from '../shared/types';
import { esc, html, uid } from '../shared/dom';
import { icon } from '../shared/icons';
import './provider-form';

type Kind = 'chat' | 'image';

/** iOS 设置页风格的提供商列表:行式列表,点击 push 详情编辑页。 */
export class ProviderPage extends HTMLElement {
    private kind: Kind = 'chat';
    private protocols: ProtocolOption[] = [];
    private providers: MaskedProvider[] = [];
    private defaultId: string | null = null;
    private workersBinding = false;

    configure(
        kind: Kind,
        protocols: ProtocolOption[],
        providers: MaskedProvider[],
        defaultId: string | null,
        workersBinding = false,
    ): void {
        this.kind = kind;
        this.protocols = protocols;
        this.providers = providers.map(p => ({ ...p, models: [...(p.models || [])] }));
        this.defaultId = defaultId;
        this.workersBinding = workersBinding;
        this.render();
    }

    get value(): { providers: MaskedProvider[]; defaultId: string | null } {
        return { providers: this.providers, defaultId: this.defaultId };
    }

    private get backLabel(): string {
        return this.kind === 'chat' ? 'Chat' : 'Image';
    }

    private tint(i: number): string {
        const palette = ['var(--blue)', 'var(--purple)', 'var(--teal)', 'var(--orange)', 'var(--green)', 'var(--red)'];
        return palette[i % palette.length];
    }

    private render(): void {
        const rows = this.providers
            .map((p, i) => {
                const isDefault = this.defaultId === p.id;
                const sub = [
                    p.model || 'No model',
                    `${p.models.length} model${p.models.length === 1 ? '' : 's'}`,
                    p.enabled ? '' : 'Disabled',
                ]
                    .filter(Boolean)
                    .join(' · ');
                return `
                <button type="button" class="list-row" data-edit="${esc(p.id)}">
                    <span class="row-icon" style="background:${this.tint(i)}">${esc((p.label || p.protocol)[0].toUpperCase())}</span>
                    <span class="row-main">
                        <span class="row-title">${esc(p.label || p.protocol)}</span>
                        <span class="row-sub">${esc(sub)}</span>
                    </span>
                    ${isDefault ? `<span class="row-check">${icon('check')}</span>` : ''}
                    ${icon('chevron-right')}
                </button>
            `;
            })
            .join('');
        const empty = this.providers.length
            ? ''
            : '<div class="list-row"><span class="row-main"><span class="row-sub">No providers yet. Add one to start chatting.</span></span></div>';
        this.replaceChildren(
            html(`
            <main>
                <section class="list-group">
                    <button type="button" class="list-row" data-add>
                        <span class="row-icon" style="background:var(--green)">${icon('plus')}</span>
                        <span class="row-main"><span class="row-title">Add Provider</span><span class="row-sub">Custom API endpoint</span></span>
                    </button>
                </section>
                <section class="list-group">${empty}${rows}</section>
                <p class="group-footer">Tap a provider to edit its endpoint, models and options. The checkmark marks the default provider for ${this.kind === 'chat' ? 'chat' : 'image generation'}.</p>
            </main>
        `),
        );
        this.querySelector('[data-add]')?.addEventListener('click', () => {
            const protocol = this.protocols[0];
            if (!protocol) {
                return;
            }
            const draft = this.blank(protocol);
            this.openForm(draft, true);
        });
        this.querySelectorAll<HTMLButtonElement>('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => {
                const provider = this.providers.find(p => p.id === btn.dataset.edit);
                if (provider) {
                    this.openForm(provider, false);
                }
            });
        });
    }

    private blank(protocol: ProtocolOption): MaskedProvider {
        return {
            id: uid(this.kind),
            protocol: protocol.id,
            label: '',
            enabled: true,
            hasApiKey: false,
            apiKey: '',
            baseUrl: protocol.defaultBaseUrl,
            model: '',
            models: [],
            extraParams: {},
            options: {},
        };
    }

    private openForm(provider: MaskedProvider, isDraft: boolean): void {
        // 新建时立即入列:详情页关闭即自动保存,无需单独的提交按钮;
        // 空草稿(没添加任何模型)在关闭时被丢弃
        if (isDraft) {
            this.providers.push(provider);
        }
        this.dispatchEvent(
            new CustomEvent('push', {
                bubbles: true,
                composed: true,
                detail: {
                    title: isDraft ? 'Add Provider' : provider.label || provider.protocol,
                    back: this.backLabel,
                    onClose: () => {
                        if (isDraft && !provider.models.length) {
                            this.providers = this.providers.filter(x => x.id !== provider.id);
                        }
                        this.render();
                    },
                    autosave: true,
                    mount: (el: HTMLElement) => {
                        const form = document.createElement('provider-form') as any;
                        form.open(this.kind, this.protocols, provider, {
                            isDraft,
                            isDefault: this.defaultId === provider.id,
                            workersBinding: this.workersBinding,
                            onDefault: (on: boolean) => {
                                if (on) {
                                    this.defaultId = provider.id;
                                } else if (this.defaultId === provider.id) {
                                    this.defaultId = null;
                                }
                            },
                            onRemove: () => {
                                this.providers = this.providers.filter(x => x.id !== provider.id);
                                if (this.defaultId === provider.id) {
                                    this.defaultId = null;
                                }
                            },
                        });
                        el.replaceChildren(form);
                    },
                },
            }),
        );
    }
}

customElements.define('provider-page', ProviderPage);
