import type { MaskedProvider, ProtocolOption } from '../shared/types';
import { api } from '../shared/api';
import { armConfirm, esc, html, toast } from '../shared/dom';
import { icon } from '../shared/icons';

type Kind = 'chat' | 'image';

interface FormOptions {
    isDraft: boolean;
    isDefault: boolean;
    /** 部署已绑定 Workers AI:workers 提供商的 accountId/token 变为可选 */
    workersBinding: boolean;
    onDefault: (on: boolean) => void;
    onRemove: () => void;
}

/**
 * 提供商详情编辑页(push 进入):字段行 + 模型选择 + 开关 + 删除。
 * 直接修改传入的 provider 对象,父页面在关闭后刷新列表。
 */
export class ProviderForm extends HTMLElement {
    private kind: Kind = 'chat';
    private protocols: ProtocolOption[] = [];
    private provider!: MaskedProvider;
    private opts!: FormOptions;
    private addingModel = false;
    private fetched: string[] | null = null;
    private fetching = false;

    open(kind: Kind, protocols: ProtocolOption[], provider: MaskedProvider, opts: FormOptions): void {
        this.kind = kind;
        this.protocols = protocols;
        this.provider = provider;
        this.opts = opts;
        this.addingModel = false;
        this.fetched = null;
        this.fetching = false;
        this.render();
    }

    private close(): void {
        this.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
    }

    private addModels(names: string[]): void {
        for (const name of names) {
            const model = name.trim();
            if (model && !this.provider.models.includes(model)) {
                this.provider.models.push(model);
            }
        }
        this.provider.model = this.provider.model || this.provider.models[0] || '';
        if (!this.provider.label) {
            this.provider.label = this.protocols.find(x => x.id === this.provider.protocol)?.label || '';
        }
        this.addingModel = false;
        this.render();
    }

    private async fetchModels(): Promise<void> {
        if (this.fetching) {
            return;
        }
        this.fetching = true;
        this.render();
        try {
            const res = await api.models(this.kind, this.provider);
            if (res.error) {
                throw new Error(res.error);
            }
            this.fetched = res.models;
        } catch (e) {
            toast((e as Error).message, true);
        } finally {
            this.fetching = false;
            this.render();
        }
    }

    private render(): void {
        const p = this.provider;
        const protocol = this.protocols.find(x => x.id === p.protocol);
        const protocolOptions = this.protocols
            .map(x => `<option value="${esc(x.id)}" ${x.id === p.protocol ? 'selected' : ''}>${esc(x.label)}</option>`)
            .join('');
        const optionRows = (protocol?.optionFields || [])
            .map(
                f => `
                <div class="row-field">
                    <span class="row-label">${esc(f.label)}${f.required ? ' <span style="color:var(--red)">*</span>' : ''}</span>
                    <input class="bare" ${f.type === 'password' ? 'type="password" autocomplete="off"' : ''} data-opt="${esc(f.key)}" value="${esc((p.options?.[f.key] as string) ?? '')}" placeholder="${esc(f.placeholder || '')}" aria-label="${esc(f.label)}" />
                </div>`,
            )
            .join('');

        // workers 不读取 baseUrl/apiKey,展示它们只会让人误以为必填
        const showBaseUrl = protocol?.usesBaseUrl !== false;
        const showApiKey = protocol?.usesApiKey !== false;

        const baseUrlRow = showBaseUrl
            ? `<div class="row-field">
                   <span class="row-label">Base URL</span>
                   <input class="bare" type="url" inputmode="url" data-field="baseUrl" value="${esc(p.baseUrl)}" placeholder="https://api.example.com/v1" aria-label="Base URL" />
               </div>`
            : '';
        const apiKeyRow = showApiKey
            ? `<div class="row-field">
                   <span class="row-label">API Key</span>
                   <input class="bare" type="password" data-field="apiKey" value="${esc(p.apiKey)}"
                       placeholder="${p.hasApiKey && !p.clearApiKey ? 'Unchanged' : 'Required'}" autocomplete="off" aria-label="API key" />
               </div>`
            : '';

        // 已保存的 Key 提供显式清除入口:清空输入框表示「不变」,删除必须显式触发
        const clearKeyRow = !showApiKey
            ? ''
            : p.clearApiKey
              ? `<button type="button" class="list-row" data-undo-clear-key>
                     <span class="row-main"><span class="row-title">Key Will Be Removed</span><span class="row-sub">Tap to undo</span></span>
                 </button>`
              : p.hasApiKey && !p.apiKey
                ? `<button type="button" class="list-row destructive" data-clear-key>Clear API Key</button>`
                : '';

        // workers 有 AI 绑定时不需要 accountId/token;无绑定时才回退到凭据
        const workersHint =
            p.protocol === 'workers'
                ? this.opts.workersBinding
                    ? '<p class="group-footer">AI binding detected. Account ID and API Token are optional and only used when the binding is unavailable.</p>'
                    : '<p class="group-footer">No AI binding on this deployment. Fill in Account ID and API Token, or add the AI binding.</p>'
                : '';

        const modelRows = p.models
            .map(
                model => `
                <div class="list-row">
                    <button type="button" class="row-btn" data-remove-model="${esc(model)}" aria-label="Remove model ${esc(model)}">${icon('minus-circle')}</button>
                    <button type="button" class="row-main row-main-btn" data-pick-model="${esc(model)}">
                        <span class="row-title" style="font-family:var(--mono);font-size:15px">${esc(model)}</span>
                    </button>
                    ${p.model === model ? `<span class="row-check">${icon('check')}</span>` : ''}
                </div>`,
            )
            .join('');
        const emptyModels = p.models.length
            ? ''
            : '<div class="list-row"><span class="row-main"><span class="row-sub">No models. Add one to use this provider.</span></span></div>';
        const addModelRow = this.addingModel
            ? `<div class="list-row">
                  <input class="bare left mono" data-model-input placeholder="model name" aria-label="Model name" />
                  <button type="button" class="row-btn blue" data-cancel-model aria-label="Cancel">Cancel</button>
                  <button type="button" class="row-btn blue" data-confirm-model aria-label="Add model">Add</button>
              </div>`
            : `<button type="button" class="list-row" data-add-model>
                  <span class="row-icon" style="background:var(--green)">${icon('plus')}</span>
                  <span class="row-main"><span class="row-title">Add Model</span></span>
              </button>`;
        const fetchRow =
            protocol?.modelList === 'none'
                ? ''
                : `<button type="button" class="list-row" data-fetch-models>
                      <span class="row-icon" style="background:var(--teal)">${icon('refresh')}</span>
                      <span class="row-main"><span class="row-title">Fetch Models</span><span class="row-sub">Load the model list from the API</span></span>
                      <span class="row-value">${this.fetching ? '<div class="spinner"></div>' : this.fetched ? `${this.fetched.length} found` : ''}</span>
                  </button>`;

        const fetchedSection =
            this.fetched && this.fetched.length
                ? `<h2 class="section-h">Fetched models</h2>
                   <section class="list-group">
                       ${this.fetched
                           .map(
                               m => `
                               <button type="button" class="list-row" data-add-fetched="${esc(m)}">
                                   <span class="row-main"><span class="row-title" style="font-family:var(--mono);font-size:15px">${esc(m)}</span></span>
                                   ${p.models.includes(m) ? `<span class="row-check">${icon('check')}</span>` : icon('plus')}
                               </button>`,
                           )
                           .join('')}
                       <button type="button" class="list-row" data-add-all-fetched>
                           <span class="row-main"><span class="row-title">Add All</span></span>
                       </button>
                   </section>`
                : '';

        const deleteRow = this.opts.isDraft
            ? ''
            : `<h2 class="section-h"></h2>
               <section class="list-group">
                   <button type="button" class="list-row destructive" data-remove>Delete Provider</button>
               </section>`;

        this.replaceChildren(
            html(`
            <main>
                <h2 class="section-h">Provider</h2>
                <section class="list-group">
                    <div class="row-field">
                        <span class="row-label">Name</span>
                        <input class="bare" data-field="label" value="${esc(p.label)}" placeholder="${esc(protocol?.label || p.protocol)}" aria-label="Name" />
                    </div>
                    <div class="row-field">
                        <span class="row-label">API Format</span>
                        <select class="bare" data-apply-protocol aria-label="API format">${protocolOptions}</select>
                    </div>
                    ${baseUrlRow}
                    ${apiKeyRow}
                    ${clearKeyRow}
                    ${optionRows}
                </section>
                ${workersHint}
                <p class="group-footer">API format switch resets the base URL and protocol options.</p>

                <h2 class="section-h">Models</h2>
                <section class="list-group">${emptyModels}${modelRows}${addModelRow}${fetchRow}</section>
                <p class="group-footer">Tap a model to make it the default. The checkmark marks the current default.</p>
                ${fetchedSection}

                <h2 class="section-h">Options</h2>
                <section class="list-group">
                    <label class="list-row">
                        <span class="row-main"><span class="row-title">Enabled</span></span>
                        <input type="checkbox" class="switch" data-toggle-enabled ${p.enabled ? 'checked' : ''} />
                    </label>
                    <button type="button" class="list-row" data-toggle-default>
                        <span class="row-icon" style="background:var(--orange)">${icon('star')}</span>
                        <span class="row-main"><span class="row-title">Set as Default</span><span class="row-sub">Use for every request by default</span></span>
                        ${this.opts.isDefault ? `<span class="row-check">${icon('check')}</span>` : ''}
                    </button>
                </section>

                <h2 class="section-h">Extra Params</h2>
                <section class="list-group">
                    <div class="row-stack">
                        <span class="row-label">${this.kind === 'image' ? 'JSON, merged into image generation requests' : 'JSON, merged into chat completion requests'}</span>
                        <textarea class="bare code" data-field="extraParams" placeholder='{"key":"value"}' spellcheck="false">${esc(
                            JSON.stringify(p.extraParams || {}, null, 2),
                        )}</textarea>
                    </div>
                </section>
                ${deleteRow}
            </main>
        `),
        );
        this.bind();
    }

    private bind(): void {
        const p = this.provider;
        const rerender = () => this.render();

        this.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-field]').forEach(input => {
            const field = input.dataset.field as string;
            const handler = () => {
                if (field === 'extraParams') {
                    try {
                        p.extraParams = JSON.parse(input.value || '{}');
                    } catch {
                        /* 输入过程中允许暂时非法 */
                    }
                    return;
                }
                if (field === 'apiKey') {
                    // 一旦输入新 Key,之前「删除」的意图即作废
                    p.clearApiKey = false;
                }
                (p as any)[field] = input.value;
            };
            input.addEventListener('input', handler);
            input.addEventListener('change', handler);
        });

        this.querySelectorAll<HTMLInputElement>('[data-opt]').forEach(input => {
            const key = input.dataset.opt!;
            const handler = () => {
                p.options = { ...p.options, [key]: input.value };
            };
            input.addEventListener('input', handler);
            input.addEventListener('change', handler);
        });

        this.querySelector<HTMLSelectElement>('[data-apply-protocol]')?.addEventListener('change', e => {
            const protocol = this.protocols.find(x => x.id === (e.target as HTMLSelectElement).value);
            p.protocol = (e.target as HTMLSelectElement).value;
            p.baseUrl = protocol?.defaultBaseUrl || '';
            p.options = {};
            rerender();
        });

        this.querySelectorAll<HTMLButtonElement>('[data-pick-model]').forEach(btn => {
            btn.addEventListener('click', () => {
                p.model = btn.dataset.pickModel!;
                rerender();
            });
        });
        this.querySelectorAll<HTMLButtonElement>('[data-remove-model]').forEach(btn => {
            btn.addEventListener('click', () => {
                const model = btn.dataset.removeModel!;
                p.models = p.models.filter(m => m !== model);
                if (p.model === model) {
                    p.model = p.models[0] || '';
                }
                rerender();
            });
        });

        this.querySelector('[data-add-model]')?.addEventListener('click', () => {
            this.addingModel = true;
            rerender();
            this.querySelector<HTMLInputElement>('[data-model-input]')?.focus();
        });
        this.querySelector('[data-cancel-model]')?.addEventListener('click', () => {
            this.addingModel = false;
            rerender();
        });
        const confirmModel = () => {
            const value = this.querySelector<HTMLInputElement>('[data-model-input]')?.value.trim();
            if (value) {
                this.addModels([value]);
            } else {
                this.addingModel = false;
                rerender();
            }
        };
        this.querySelector('[data-confirm-model]')?.addEventListener('click', confirmModel);
        this.querySelector('[data-model-input]')?.addEventListener('keydown', e => {
            if ((e as KeyboardEvent).key === 'Enter') {
                e.preventDefault();
                confirmModel();
            }
        });

        this.querySelector('[data-fetch-models]')?.addEventListener('click', () => this.fetchModels());
        this.querySelectorAll<HTMLButtonElement>('[data-add-fetched]').forEach(btn => {
            btn.addEventListener('click', () => this.addModels([btn.dataset.addFetched!]));
        });
        this.querySelector('[data-add-all-fetched]')?.addEventListener('click', () =>
            this.addModels(this.fetched || []),
        );

        this.querySelector('[data-toggle-enabled]')?.addEventListener('change', e => {
            p.enabled = (e.target as HTMLInputElement).checked;
        });
        this.querySelector('[data-toggle-default]')?.addEventListener('click', () => {
            this.opts.onDefault(!this.opts.isDefault);
            this.opts.isDefault = !this.opts.isDefault;
            rerender();
        });

        const clearKeyBtn = this.querySelector<HTMLButtonElement>('[data-clear-key]');
        clearKeyBtn?.addEventListener('click', () =>
            armConfirm(
                clearKeyBtn,
                () => {
                    p.clearApiKey = true;
                    p.apiKey = '';
                    rerender();
                },
                'Tap again to remove',
            ),
        );
        this.querySelector('[data-undo-clear-key]')?.addEventListener('click', () => {
            p.clearApiKey = false;
            rerender();
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

customElements.define('provider-form', ProviderForm);
