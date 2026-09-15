import type { AppSettings } from '../shared/types';
import { esc, fragment, html } from '../shared/dom';
import { icon } from '../shared/icons';

type FieldType = 'text' | 'number' | 'boolean' | 'list' | 'select' | 'textarea';

interface FieldDef {
    key: keyof AppSettings;
    label: string;
    type: FieldType;
    options?: string[];
    placeholder?: string;
    group: GroupId;
    /** list 类型:列表下方说明与新增项按钮文案 */
    footer?: string;
    addLabel?: string;
}

type GroupId = 'general' | 'chat' | 'telegram' | 'access' | 'history';

interface GroupDef {
    id: GroupId;
    label: string;
    icon: string;
    tint: string;
    /** 详情页底部的分组说明 */
    footer?: string;
}

/**
 * 设置根页是分组菜单(点击 push 进入各分组子页),子页内的字段直接改共享的 settings 对象。
 * 分组只是导航层级,一组字段一个子页;参见 GROUPS。
 */
const GROUPS: GroupDef[] = [
    {
        id: 'general',
        label: 'General',
        icon: 'gear',
        tint: 'var(--blue)',
        footer: 'Public Base URL is the HTTPS domain used for the webhook and admin links.',
    },
    { id: 'chat', label: 'Chat & Streaming', icon: 'bot', tint: 'var(--green)' },
    { id: 'telegram', label: 'Telegram', icon: 'globe', tint: 'var(--teal)' },
    { id: 'access', label: 'Access Control', icon: 'lock', tint: 'var(--orange)' },
    { id: 'history', label: 'History', icon: 'refresh', tint: 'var(--purple)' },
];

const FIELDS: FieldDef[] = [
    { key: 'publicBaseUrl', label: 'Public Base URL', type: 'text', group: 'general' },
    { key: 'systemInitMessage', label: 'System Prompt', type: 'textarea', group: 'general' },
    { key: 'language', label: 'Language', type: 'select', options: ['zh-cn', 'zh-hant', 'en', 'pt'], group: 'general' },
    { key: 'updateBranch', label: 'Update Branch', type: 'text', group: 'general' },

    { key: 'streamMode', label: 'Stream Mode', type: 'boolean', group: 'chat' },
    { key: 'safeMode', label: 'Safe Mode', type: 'boolean', group: 'chat' },
    { key: 'debugMode', label: 'Debug Mode', type: 'boolean', group: 'chat' },
    { key: 'devMode', label: 'Dev Mode', type: 'boolean', group: 'chat' },
    { key: 'chatCompleteApiTimeout', label: 'API Timeout (s)', type: 'number', group: 'chat' },
    { key: 'maxOutputTokens', label: 'Max Output Tokens', type: 'number', group: 'chat' },
    { key: 'telegramMinStreamInterval', label: 'Stream Interval (ms)', type: 'number', group: 'chat' },
    {
        key: 'defaultParseMode',
        label: 'Parse Mode',
        type: 'select',
        options: ['Markdown', 'MarkdownV2', 'HTML'],
        group: 'chat',
    },
    { key: 'extraMessageContext', label: 'Extra Message Context', type: 'boolean', group: 'chat' },
    { key: 'showReplyButton', label: 'Show Reply Button', type: 'boolean', group: 'chat' },
    { key: 'modelListColumns', label: 'Model List Columns', type: 'number', group: 'chat' },
    {
        key: 'hideCommandButtons',
        label: 'Hide Command Buttons',
        type: 'list',
        group: 'chat',
        addLabel: 'Add Command',
        placeholder: '/command',
        footer: 'Commands removed from the bot command menu. Add one per entry.',
    },

    { key: 'telegramApiDomain', label: 'Telegram API Domain', type: 'text', group: 'telegram' },
    { key: 'telegramPhotoSizeOffset', label: 'Photo Size Offset', type: 'number', group: 'telegram' },
    {
        key: 'telegramImageTransferMode',
        label: 'Image Transfer',
        type: 'select',
        options: ['base64', 'url'],
        group: 'telegram',
    },

    { key: 'allowAllUsers', label: 'Allow All Users', type: 'boolean', group: 'access' },
    { key: 'groupChatBotEnable', label: 'Group Bot Enable', type: 'boolean', group: 'access' },
    { key: 'groupChatBotShareMode', label: 'Group Share Mode', type: 'boolean', group: 'access' },
    {
        key: 'allowedUserIds',
        label: 'Allowed User IDs',
        type: 'list',
        group: 'access',
        addLabel: 'Add User ID',
        placeholder: '123456789',
        footer: 'Users allowed to chat with the bot. The admin ID is always allowed.',
    },
    {
        key: 'allowedGroupIds',
        label: 'Allowed Group IDs',
        type: 'list',
        group: 'access',
        addLabel: 'Add Group ID',
        placeholder: '-1001234567890',
        footer: 'Groups where the bot may respond. Negative IDs keep the leading minus sign.',
    },

    { key: 'autoTrimHistory', label: 'Auto Trim History', type: 'boolean', group: 'history' },
    { key: 'maxHistoryLength', label: 'Max History Length', type: 'number', group: 'history' },
    { key: 'maxTokenLength', label: 'Max Token Length', type: 'number', group: 'history' },
    { key: 'historyImagePlaceholder', label: 'History Image Placeholder', type: 'text', group: 'history' },
];

/** 拷贝 settings 并浅复制其中的数组,避免直接改动宿主传入的 config.settings */
function cloneSettings(settings: AppSettings): AppSettings {
    const out: AppSettings = { ...settings };
    for (const key of Object.keys(out)) {
        if (Array.isArray(out[key])) {
            out[key] = [...(out[key] as unknown[])];
        }
    }
    return out;
}

/**
 * 分组设置子页(push 进入):渲染某一组的字段,直接修改传入的 settings 对象。
 * 布尔/文本/数字/下拉为行式字段;list 类型渲染成可增删的列表(参考 provider-form 的模型列表)。
 */
class SettingsDetail extends HTMLElement {
    private groupId: GroupId = 'general';
    private settings: AppSettings = {};
    /** 正在新增的 list 字段 key(同一子页可能有多个 list 字段) */
    private addingField: string | null = null;
    private draft = '';

    open(groupId: GroupId, settings: AppSettings): void {
        this.groupId = groupId;
        this.settings = settings;
        this.addingField = null;
        this.draft = '';
        this.render();
    }

    private arrayOf(key: string): string[] {
        const value = this.settings[key];
        return Array.isArray(value) ? (value as string[]) : [];
    }

    private renderField(field: FieldDef): string {
        const value = this.settings[field.key];
        const attrs = `data-key="${esc(field.key)}"`;
        const label = esc(field.label);
        if (field.type === 'boolean') {
            return `<label class="list-row">
                <span class="row-main"><span class="row-title">${label}</span></span>
                <input type="checkbox" class="switch" ${attrs} ${value ? 'checked' : ''} aria-label="${label}" />
            </label>`;
        }
        if (field.type === 'textarea') {
            return `<div class="row-stack">
                <span class="row-label">${label}</span>
                <textarea class="bare" ${attrs} aria-label="${label}">${esc(value ?? '')}</textarea>
            </div>`;
        }
        let control: string;
        if (field.type === 'number') {
            control = `<input class="bare" type="number" inputmode="decimal" ${attrs} value="${esc(value ?? 0)}" aria-label="${label}" />`;
        } else if (field.type === 'select') {
            const opts = (field.options || [])
                .map(o => `<option value="${esc(o)}" ${o === value ? 'selected' : ''}>${esc(o)}</option>`)
                .join('');
            control = `<select class="bare" ${attrs} aria-label="${label}">${opts}</select>`;
        } else {
            control = `<input class="bare" type="text" ${attrs} value="${esc(value ?? '')}" placeholder="${esc(field.placeholder || '')}" aria-label="${label}" />`;
        }
        return `<div class="row-field">
            <span class="row-label">${label}</span>
            ${control}
        </div>`;
    }

    private renderListField(field: FieldDef): string {
        const key = String(field.key);
        const values = this.arrayOf(key);
        const rows = values
            .map(
                value => `
                <div class="list-row">
                    <button type="button" class="row-btn" data-list-remove="${key}" data-value="${esc(value)}" aria-label="Remove ${esc(value)}">${icon('minus-circle')}</button>
                    <span class="row-main"><span class="row-title mono">${esc(value)}</span></span>
                </div>`,
            )
            .join('');
        const empty = values.length
            ? ''
            : '<div class="list-row"><span class="row-main"><span class="row-sub">No entries yet.</span></span></div>';
        const addRow =
            this.addingField === key
                ? `<div class="list-row">
                       <input class="bare left mono" data-list-input="${key}" value="${esc(this.draft)}" placeholder="${esc(field.placeholder || '')}" aria-label="${esc(field.addLabel || 'Add')}" />
                       <button type="button" class="row-btn blue" data-list-cancel="${key}" aria-label="Cancel">Cancel</button>
                       <button type="button" class="row-btn blue" data-list-confirm="${key}" aria-label="Add">Add</button>
                   </div>`
                : `<button type="button" class="list-row" data-list-add="${key}">
                       <span class="row-icon" style="background:var(--green)">${icon('plus')}</span>
                       <span class="row-main"><span class="row-title">${esc(field.addLabel || 'Add')}</span></span>
                   </button>`;
        const footer = field.footer ? `<p class="group-footer">${esc(field.footer)}</p>` : '';
        return `<h2 class="section-h">${esc(field.label)}</h2><section class="list-group">${empty}${rows}${addRow}</section>${footer}`;
    }

    /** 连续的非列表字段合成一个 list-group,列表字段单独成组,保持 FIELDS 中的顺序 */
    private render(): void {
        const fields = FIELDS.filter(f => f.group === this.groupId);
        const parts: string[] = [];
        let buffer: string[] = [];
        const flush = () => {
            if (buffer.length) {
                parts.push(`<section class="list-group">${buffer.join('')}</section>`);
                buffer = [];
            }
        };
        for (const field of fields) {
            if (field.type === 'list') {
                flush();
                parts.push(this.renderListField(field));
            } else {
                buffer.push(this.renderField(field));
            }
        }
        flush();
        const footer = GROUPS.find(g => g.id === this.groupId)?.footer;
        if (footer) {
            parts.push(`<p class="group-footer">${esc(footer)}</p>`);
        }
        this.replaceChildren(html(`<main>${parts.join('')}</main>`));
        this.bind();
    }

    private confirmEntry(key: string): void {
        const value = this.draft.trim();
        if (value) {
            const entries = this.arrayOf(key);
            if (!entries.includes(value)) {
                this.settings[key] = [...entries, value];
            }
        }
        this.addingField = null;
        this.draft = '';
        this.render();
    }

    private bind(): void {
        const settings = this.settings;
        this.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('[data-key]').forEach(el => {
            const key = (el as HTMLElement).dataset.key!;
            const type = FIELDS.find(f => String(f.key) === key)?.type || 'text';
            const handler = () => {
                if (type === 'boolean') {
                    settings[key] = (el as HTMLInputElement).checked;
                } else if (type === 'number') {
                    const num = Number((el as HTMLInputElement).value);
                    settings[key] = Number.isFinite(num) ? num : 0;
                } else {
                    settings[key] = el.value;
                }
            };
            el.addEventListener('input', handler);
            el.addEventListener('change', handler);
        });

        this.querySelectorAll<HTMLButtonElement>('[data-list-remove]').forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.listRemove!;
                const value = btn.dataset.value!;
                settings[key] = this.arrayOf(key).filter(v => v !== value);
                this.render();
            });
        });
        this.querySelectorAll<HTMLButtonElement>('[data-list-add]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addingField = btn.dataset.listAdd!;
                this.draft = '';
                this.render();
                this.querySelector<HTMLInputElement>('[data-list-input]')?.focus();
            });
        });
        this.querySelectorAll<HTMLButtonElement>('[data-list-cancel]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.addingField = null;
                this.draft = '';
                this.render();
            });
        });
        this.querySelectorAll<HTMLButtonElement>('[data-list-confirm]').forEach(btn => {
            btn.addEventListener('click', () => this.confirmEntry(btn.dataset.listConfirm!));
        });
        this.querySelectorAll<HTMLInputElement>('[data-list-input]').forEach(input => {
            input.addEventListener('input', () => {
                this.draft = input.value;
            });
            input.addEventListener('keydown', e => {
                if ((e as KeyboardEvent).key === 'Enter') {
                    e.preventDefault();
                    this.confirmEntry(input.dataset.listInput!);
                }
            });
        });
    }
}

customElements.define('settings-detail', SettingsDetail);

/**
 * 设置根页:分组菜单 + About 摘要。点击分组 push 进入 settings-detail 子页。
 * value 直接返回共享的 settings 对象(子页已就地修改),无需从 DOM 收集。
 */
export class SettingsForm extends HTMLElement {
    private settings: AppSettings = {};
    private aboutInfo: { version: string | null; chat: any; image: any } | null = null;

    set value(settings: AppSettings) {
        this.settings = cloneSettings(settings);
        this.render();
    }

    /** 顶部 About 信息(版本号、当前模型),由宿主在 load 后注入 */
    set about(v: { version: string | null; chat: any; image: any } | null) {
        this.aboutInfo = v;
        if (this.settings) {
            this.render();
        }
    }

    get value(): AppSettings {
        return this.settings;
    }

    /** 分组行的副标题:给每个子页一个当前值摘要 */
    private summary(group: GroupId): string {
        const s = this.settings;
        switch (group) {
            case 'general':
                return s.publicBaseUrl ? String(s.publicBaseUrl) : 'Not configured';
            case 'chat':
                return `${s.streamMode ? 'Streaming' : 'No streaming'} · ${s.defaultParseMode || 'Markdown'}`;
            case 'telegram':
                return String(s.telegramApiDomain || 'api.telegram.org');
            case 'access': {
                if (s.allowAllUsers) {
                    return 'All users allowed';
                }
                const users = this.arrayLength('allowedUserIds');
                const groups = this.arrayLength('allowedGroupIds');
                return `${users} user${users === 1 ? '' : 's'}, ${groups} group${groups === 1 ? '' : 's'}`;
            }
            case 'history':
                return `Max ${String(s.maxHistoryLength ?? 0)} messages`;
        }
    }

    private arrayLength(key: string): number {
        const value = this.settings[key];
        return Array.isArray(value) ? value.length : 0;
    }

    private openGroup(group: GroupDef): void {
        this.dispatchEvent(
            new CustomEvent('push', {
                bubbles: true,
                composed: true,
                detail: {
                    title: group.label,
                    back: 'Settings',
                    onClose: () => this.render(),
                    autosave: true,
                    mount: (el: HTMLElement) => {
                        const detail = document.createElement('settings-detail') as any;
                        detail.open(group.id, this.settings);
                        el.replaceChildren(detail);
                    },
                },
            }),
        );
    }

    private render(): void {
        const rows = GROUPS.map(
            group => `
            <button type="button" class="list-row" data-goto="${group.id}">
                <span class="row-icon" style="background:${group.tint}">${icon(group.icon)}</span>
                <span class="row-main">
                    <span class="row-title">${esc(group.label)}</span>
                    <span class="row-sub">${esc(this.summary(group.id))}</span>
                </span>
                ${icon('chevron-right')}
            </button>`,
        ).join('');
        // About:版本号与当前模型摘要(原 /version、/system 的信息移到这里)
        const a = this.aboutInfo;
        const modelText = (x: any): string => (x ? `${x.label || x.name} · ${x.model}` : 'Not configured');
        const about = a
            ? `<h2 class="section-h">About</h2>
               <section class="list-group">
                   <div class="list-row">
                       <span class="row-main"><span class="row-title">Version</span></span>
                       <span class="row-value mono">${esc(a.version || 'unknown')}</span>
                   </div>
                   <div class="list-row">
                       <span class="row-main"><span class="row-title">Chat Model</span></span>
                       <span class="row-value">${esc(modelText(a.chat))}</span>
                   </div>
                   <div class="list-row">
                       <span class="row-main"><span class="row-title">Image Model</span></span>
                       <span class="row-value">${esc(modelText(a.image))}</span>
                   </div>
               </section>`
            : '';
        this.replaceChildren(fragment(`<main><section class="list-group">${rows}</section>${about}</main>`));
        this.querySelectorAll<HTMLButtonElement>('[data-goto]').forEach(btn => {
            btn.addEventListener('click', () => {
                const group = GROUPS.find(g => g.id === btn.dataset.goto);
                if (group) {
                    this.openGroup(group);
                }
            });
        });
    }
}

customElements.define('settings-form', SettingsForm);
