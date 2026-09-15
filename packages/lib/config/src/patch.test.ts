import { DEFAULT_SETTINGS } from './defaults';
import { assertPatchAllowedFor, mergeConfigPatch, patchFromPath } from './patch';
import { normalizeConfig } from './store';

describe('patchFromPath', () => {
    it('builds nested settings patches', () => {
        expect(patchFromPath('settings.systemInitMessage', 'hi')).toEqual({
            settings: { systemInitMessage: 'hi' },
        });
    });

    it('builds a scalar top-level patch', () => {
        expect(patchFromPath('defaultChatProvider', 'openai')).toEqual({ defaultChatProvider: 'openai' });
    });

    it('builds an id-targeted provider patch', () => {
        expect(patchFromPath('chatProviders.openai.model', 'gpt-4o')).toEqual({
            chatProviders: [{ id: 'openai', model: 'gpt-4o' }],
        });
    });

    it('rejects empty paths', () => {
        expect(() => patchFromPath('  ', 'x')).toThrow();
    });
});

describe('mergeConfigPatch', () => {
    it('merges settings per field', () => {
        const base = normalizeConfig({ settings: { systemInitMessage: 'old', maxHistoryLength: 5 } });
        const next = mergeConfigPatch(base, { settings: { systemInitMessage: 'new' } });
        expect(next.settings.systemInitMessage).toBe('new');
        expect(next.settings.maxHistoryLength).toBe(5);
    });

    it('updates a provider by id and appends a new one', () => {
        const base = normalizeConfig({
            chatProviders: [{ id: 'a', protocol: 'chat-completions', model: 'm1' }],
        });
        const next = mergeConfigPatch(base, {
            chatProviders: [
                { id: 'a', model: 'm2', models: ['m1', 'm2'] },
                { id: 'b', protocol: 'anthropic-messages', model: 'claude' },
            ],
        });
        expect(next.chatProviders).toHaveLength(2);
        expect(next.chatProviders.find(p => p.id === 'a')!.model).toBe('m2');
        expect(next.chatProviders.find(p => p.id === 'a')!.protocol).toBe('chat-completions');
        expect(next.chatProviders.find(p => p.id === 'b')!.enabled).toBe(true);
    });

    it('resets a setting via the default value', () => {
        const base = normalizeConfig({ settings: { systemInitMessage: 'custom' } });
        const next = mergeConfigPatch(base, { settings: { systemInitMessage: DEFAULT_SETTINGS.systemInitMessage } });
        expect(next.settings.systemInitMessage).toBe(DEFAULT_SETTINGS.systemInitMessage);
    });

    it('rejects a non-object settings patch', () => {
        const base = normalizeConfig({});
        expect(() => mergeConfigPatch(base, { settings: 1 })).toThrow();
    });

    it('rejects unknown top-level and settings keys', () => {
        const base = normalizeConfig({});
        expect(() => mergeConfigPatch(base, { totallyUnknown: 1 })).toThrow(/Unknown config key/);
        expect(() => mergeConfigPatch(base, { settings: { notASetting: 1 } })).toThrow(/Unknown setting/);
    });

    it('deep-merges nested provider options instead of replacing them', () => {
        const base = normalizeConfig({
            chatProviders: [{ id: 'w', protocol: 'workers', model: 'm', options: { accountId: 'a', token: 'secret' } }],
        });
        const next = mergeConfigPatch(base, { chatProviders: [{ id: 'w', options: { accountId: 'b' } }] });
        expect(next.chatProviders[0].options).toEqual({ accountId: 'b', token: 'secret' });
    });

    it('rejects provider paths shorter than list.id.field', () => {
        expect(() => patchFromPath('chatProviders.openai', 'x')).toThrow();
    });
});

describe('assertPatchAllowedFor', () => {
    const base = normalizeConfig({
        chatProviders: [{ id: 'a', protocol: 'chat-completions', model: 'm1' }],
        imageProviders: [{ id: 'img', protocol: 'images', model: 'i1' }],
    });

    it('lets the operator write any key', () => {
        expect(() =>
            assertPatchAllowedFor('operator', {
                settings: { telegramApiDomain: 'https://evil.example', allowAllUsers: true },
                plugins: [],
                customCommands: [],
            }),
        ).not.toThrow();
    });

    it('rejects every settings key outside the benign display allow-list', () => {
        for (const key of [
            'telegramApiDomain',
            'publicBaseUrl',
            'systemInitMessage',
            'allowAllUsers',
            'allowedUserIds',
            'allowedGroupIds',
            'safeMode',
            'debugMode',
            'devMode',
            // 以下两个同样触及敏感面:出站 fetch 与模型上下文
            'updateBranch',
            'historyImagePlaceholder',
            'telegramImageTransferMode',
        ]) {
            expect(() => assertPatchAllowedFor('group_admin', { settings: { [key]: 'x' } }, base)).toThrow(
                /Setting not permitted for group admins/,
            );
        }
    });

    it('rejects plugins, customCommands and unknown top-level keys for group admins', () => {
        expect(() => assertPatchAllowedFor('group_admin', { plugins: [] }, base)).toThrow();
        expect(() => assertPatchAllowedFor('group_admin', { customCommands: [] }, base)).toThrow();
        expect(() => assertPatchAllowedFor('group_admin', { totallyUnknown: 1 }, base)).toThrow();
    });

    it('rejects provider protocol/enabled and credential fields for group admins', () => {
        expect(() =>
            assertPatchAllowedFor(
                'group_admin',
                { chatProviders: [{ id: 'a', protocol: 'anthropic-messages' }] },
                base,
            ),
        ).toThrow(/Provider field not permitted/);
        expect(() =>
            assertPatchAllowedFor('group_admin', { chatProviders: [{ id: 'a', enabled: false }] }, base),
        ).toThrow(/Provider field not permitted/);
        expect(() =>
            assertPatchAllowedFor(
                'group_admin',
                { chatProviders: [{ id: 'a', baseUrl: 'https://evil.example/v1' }] },
                base,
            ),
        ).toThrow(/Provider field not permitted/);
        expect(() => assertPatchAllowedFor('group_admin', { chatProviders: [{ id: 'a', apiKey: 'k' }] }, base)).toThrow(
            /Provider field not permitted/,
        );
        expect(() =>
            assertPatchAllowedFor('group_admin', { chatProviders: [{ id: 'a', extraParams: { system: 'x' } }] }, base),
        ).toThrow(/Provider field not permitted/);
        expect(() =>
            assertPatchAllowedFor('group_admin', { chatProviders: [{ id: 'a', options: { token: 't' } }] }, base),
        ).toThrow(/Provider field not permitted/);
    });

    it('rejects adding a new provider entry for group admins', () => {
        expect(() =>
            assertPatchAllowedFor('group_admin', { chatProviders: [{ id: 'new', model: 'x' }] }, base),
        ).toThrow(/Adding provider entries is not permitted/);
        expect(() => assertPatchAllowedFor('group_admin', { chatProviders: [{ model: 'x' }] }, base)).toThrow(
            /Adding provider entries is not permitted/,
        );
    });

    it('allows group admins to switch the default provider and tweak model/display settings', () => {
        expect(() => assertPatchAllowedFor('group_admin', { defaultChatProvider: 'a' }, base)).not.toThrow();
        expect(() => assertPatchAllowedFor('group_admin', { settings: { language: 'en' } }, base)).not.toThrow();
        expect(() =>
            assertPatchAllowedFor('group_admin', { chatProviders: [{ id: 'a', model: 'gpt-4o' }] }, base),
        ).not.toThrow();
    });
});
