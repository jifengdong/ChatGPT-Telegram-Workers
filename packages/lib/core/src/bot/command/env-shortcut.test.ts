import { DEFAULT_SETTINGS, normalizeConfig } from '@chatgpt-telegram-workers/config';
import { applyConfigShortcut, isConfigShortcutValue, parseConfigShortcut } from './env-shortcut';

describe('isConfigShortcutValue', () => {
    it('detects config-patch prefixes', () => {
        expect(isConfigShortcutValue('/setenv A=B')).toBe(true);
        expect(isConfigShortcutValue('/setenvs {}')).toBe(true);
        expect(isConfigShortcutValue('/delenv A')).toBe(true);
        expect(isConfigShortcutValue('{"defaultChatProvider":"x"}')).toBe(true);
        expect(isConfigShortcutValue('/help')).toBe(false);
        expect(isConfigShortcutValue('/gpt Hello')).toBe(false);
    });
});

describe('parseConfigShortcut', () => {
    it('parses /setenv with a dot path', () => {
        expect(parseConfigShortcut('/setenv settings.systemInitMessage=hello')!.patch).toEqual({
            settings: { systemInitMessage: 'hello' },
        });
    });

    it('keeps everything after the first = in /setenv', () => {
        expect(parseConfigShortcut('/setenv settings.systemInitMessage=a=b')!.patch).toEqual({
            settings: { systemInitMessage: 'a=b' },
        });
    });

    it('parses /setenvs JSON', () => {
        expect(parseConfigShortcut('/setenvs {"defaultChatProvider":"openai"}')!.patch).toEqual({
            defaultChatProvider: 'openai',
        });
    });

    it('parses a bare JSON object', () => {
        expect(parseConfigShortcut('{"defaultImageProvider":"x"}')!.patch).toEqual({
            defaultImageProvider: 'x',
        });
    });

    it('parses /delenv for settings by restoring the default', () => {
        expect(parseConfigShortcut('/delenv settings.systemInitMessage')!.patch).toEqual({
            settings: { systemInitMessage: DEFAULT_SETTINGS.systemInitMessage },
        });
    });

    it('parses /delenv for a default provider by clearing it', () => {
        expect(parseConfigShortcut('/delenv defaultChatProvider')!.patch).toEqual({
            defaultChatProvider: null,
        });
    });

    it('returns null for plain text', () => {
        expect(parseConfigShortcut('/help')).toBeNull();
    });

    it('throws on malformed JSON', () => {
        expect(() => parseConfigShortcut('/setenvs {not json}')).toThrow();
    });

    it('rejects unsupported /delenv keys', () => {
        expect(() => parseConfigShortcut('/delenv chatProviders')).toThrow();
    });
});

describe('applyConfigShortcut', () => {
    it('switches the default provider', () => {
        const base = normalizeConfig({ chatProviders: [{ id: 'a', protocol: 'chat-completions', model: 'm' }] });
        const shortcut = parseConfigShortcut('/setenvs {"defaultChatProvider":"a"}')!;
        expect(applyConfigShortcut(base, shortcut).defaultChatProvider).toBe('a');
    });
});
