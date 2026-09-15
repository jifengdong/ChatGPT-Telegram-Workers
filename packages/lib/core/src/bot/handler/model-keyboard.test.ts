import type { AppConfig, ChatProviderConfig } from '@chatgpt-telegram-workers/config';
import { describe, expect, it, beforeEach } from 'vitest';
import { ENV, cloneDefaultConfig } from '@chatgpt-telegram-workers/config';
import {
    MODEL_PAGE_SIZE,
    PROVIDER_PAGE_SIZE,
    currentProvider,
    enabledProviders,
    modelKeyboard,
    providerKeyboard,
    providerPage,
} from './handlers';

function chatProvider(id: string, models: string[], enabled = true): ChatProviderConfig {
    return {
        id,
        protocol: 'chat-completions',
        label: id,
        enabled,
        apiKey: 'sk-test',
        baseUrl: '',
        model: models[0] ?? '',
        models,
        extraParams: {},
        options: {},
    };
}

function seed(chatProviders: ChatProviderConfig[]): void {
    const config: AppConfig = {
        ...cloneDefaultConfig(),
        defaultChatProvider: chatProviders[0]?.id ?? null,
        chatProviders,
    };
    ENV.CONFIG = config;
}

/** 键盘里的 callback_data(按行拍平) */
function datas(keyboard: { inline_keyboard: { callback_data?: string }[][] }): string[] {
    return keyboard.inline_keyboard.flat().map(b => String(b.callback_data));
}

describe('enabledProviders / providerPage', () => {
    beforeEach(() => (ENV.CONFIG = cloneDefaultConfig()));

    it('keeps the original array index and drops disabled or model-less providers', () => {
        seed([chatProvider('disabled', ['a'], false), chatProvider('no-models', []), chatProvider('ok', ['m1'])]);
        expect(enabledProviders('chat').map(p => [p.index, p.id])).toEqual([[2, 'ok']]);
        // 下标 2 在可用列表中是第 0 个,落在第 0 页
        expect(providerPage('chat', 2)).toBe(0);
    });

    it('prefers the default provider and falls back to the first enabled one', () => {
        seed([chatProvider('alpha', ['m']), chatProvider('beta', ['m'])]);
        // seed() 把 defaultChatProvider 设为第一个
        expect(currentProvider('chat')?.id).toBe('alpha');

        ENV.CONFIG = { ...ENV.CONFIG, defaultChatProvider: 'beta' };
        expect(currentProvider('chat')?.id).toBe('beta');

        // 默认项指向已禁用/不存在的 provider 时回退到首个可用项
        ENV.CONFIG = { ...ENV.CONFIG, defaultChatProvider: 'ghost' };
        expect(currentProvider('chat')?.id).toBe('alpha');

        ENV.CONFIG = cloneDefaultConfig();
        expect(currentProvider('chat')).toBeNull();
    });

    it('maps an index to the page containing it', () => {
        seed([0, 1, 2, 3, 4].map(i => chatProvider(`p${i}`, ['m'])));
        expect(providerPage('chat', 0)).toBe(0);
        expect(providerPage('chat', PROVIDER_PAGE_SIZE - 1)).toBe(0);
        expect(providerPage('chat', PROVIDER_PAGE_SIZE)).toBe(1);
        // 未知下标回退到首页,避免越界
        expect(providerPage('chat', 99)).toBe(0);
    });
});

describe('providerKeyboard', () => {
    beforeEach(() => (ENV.CONFIG = cloneDefaultConfig()));

    it('marks the current provider with a check mark', () => {
        seed([chatProvider('alpha', ['m']), chatProvider('beta', ['m'])]);
        const keyboard = providerKeyboard('chat', 0, 'beta');
        expect(keyboard.inline_keyboard.map(row => row[0].text)).toEqual(['alpha', '✓ beta']);
    });

    it('omits the pagination row when there are no more than PROVIDER_PAGE_SIZE providers', () => {
        seed(Array.from({ length: PROVIDER_PAGE_SIZE }, (_, i) => chatProvider(`p${i}`, ['m'])));
        const keyboard = providerKeyboard('chat', 0, null);
        expect(keyboard.inline_keyboard).toHaveLength(PROVIDER_PAGE_SIZE);
        expect(datas(keyboard).some(d => d === 'page')).toBe(false);
    });

    it('paginates and only renders the usable arrow on each page', () => {
        seed(Array.from({ length: PROVIDER_PAGE_SIZE + 2 }, (_, i) => chatProvider(`p${i}`, ['m'])));

        const first = providerKeyboard('chat', 0, null);
        // 4 个 provider + 翻页行
        expect(first.inline_keyboard).toHaveLength(PROVIDER_PAGE_SIZE + 1);
        const firstNav = first.inline_keyboard.at(-1) ?? [];
        expect(firstNav.map(b => b.text)).toEqual(['1/2', '➡️']);
        expect(firstNav.at(-1)?.callback_data).toBe('mp:1');

        const second = providerKeyboard('chat', 1, null);
        const secondNav = second.inline_keyboard.at(-1) ?? [];
        expect(secondNav.map(b => b.text)).toEqual(['⬅️', '2/2']);
        expect(secondNav[0].callback_data).toBe('mp:0');
        // 第 2 页剩 2 个,且按钮带原数组下标
        expect(datas(second).filter(d => d.startsWith('ml:'))).toEqual([
            `ml:${PROVIDER_PAGE_SIZE}:0`,
            `ml:${PROVIDER_PAGE_SIZE + 1}:0`,
        ]);
    });

    it('clamps an out-of-range page instead of showing an empty keyboard', () => {
        seed(Array.from({ length: PROVIDER_PAGE_SIZE + 1 }, (_, i) => chatProvider(`p${i}`, ['m'])));
        expect(datas(providerKeyboard('chat', 99, null))).toEqual(datas(providerKeyboard('chat', 1, null)));
    });
});

describe('modelKeyboard', () => {
    beforeEach(() => (ENV.CONFIG = cloneDefaultConfig()));

    it('omits the pagination row when there are no more than MODEL_PAGE_SIZE models', () => {
        seed([
            chatProvider(
                'p0',
                Array.from({ length: MODEL_PAGE_SIZE }, (_, i) => `m${i}`),
            ),
        ]);
        const keyboard = modelKeyboard('chat', 0, 'm0', ENV.CONFIG.chatProviders[0].models, 0);
        // 6 个模型 + 返回按钮行
        expect(keyboard.inline_keyboard).toHaveLength(MODEL_PAGE_SIZE + 1);
        expect(datas(keyboard).some(d => d === 'page')).toBe(false);
    });

    it('keeps global model indices in callback_data across pages', () => {
        const models = Array.from({ length: MODEL_PAGE_SIZE + 3 }, (_, i) => `m${i}`);
        seed([chatProvider('p0', models)]);

        const first = modelKeyboard('chat', 0, 'm0', models, 0);
        expect(datas(first).filter(d => d.startsWith('m:'))).toEqual(
            Array.from({ length: MODEL_PAGE_SIZE }, (_, i) => `m:0:${i}`),
        );

        const second = modelKeyboard('chat', 0, 'm0', models, 1);
        expect(datas(second).filter(d => d.startsWith('m:'))).toEqual(
            Array.from({ length: 3 }, (_, i) => `m:0:${MODEL_PAGE_SIZE + i}`),
        );
        // 第 2 页的翻页行只保留 ⬅️
        expect((second.inline_keyboard.at(-2) ?? []).map(b => b.text)).toEqual(['⬅️', '2/2']);
    });

    it('adds a back button pointing at the page holding this provider', () => {
        seed(Array.from({ length: PROVIDER_PAGE_SIZE + 1 }, (_, i) => chatProvider(`p${i}`, ['m'])));
        // 第 5 个 provider(PROVIDER_PAGE_SIZE)位于 provider 列表第 2 页
        const keyboard = modelKeyboard('chat', PROVIDER_PAGE_SIZE, 'm', ['m'], 0);
        const back = keyboard.inline_keyboard.at(-1)?.[0];
        expect(back?.callback_data).toBe('mp:1');
    });

    it('marks the current model and uses the image prefixes for image keyboards', () => {
        seed([chatProvider('p0', ['a', 'b'])]);
        const keyboard = modelKeyboard('image', 0, 'b', ['a', 'b'], 0);
        // 末行是返回 provider 列表的按钮,不参与模型行断言
        expect(keyboard.inline_keyboard.slice(0, 2).map(row => row[0].text)).toEqual(['a', '✓ b']);
        expect(datas(keyboard).filter(d => d.startsWith('im:'))).toEqual(['im:0:0', 'im:0:1']);
        expect(keyboard.inline_keyboard.at(-1)?.[0].callback_data).toBe('ip:0');
    });
});
