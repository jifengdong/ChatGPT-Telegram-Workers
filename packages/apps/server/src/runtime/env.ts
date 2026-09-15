import * as fs from 'node:fs';
import { parse, type ParseError, printParseErrorCode } from 'jsonc-parser';

/**
 * 读取 wrangler.jsonc(Workers JSONC 配置)的 vars 作为环境配置,
 * 并校验其中声明的 KV 绑定已通过 options 提供(DATABASE)。
 */
export function initEnv(config: string, options: Record<string, any> = {}): Record<string, any> {
    let env: Record<string, any> = { ...options };
    if (!config) {
        return env;
    }
    const errors: ParseError[] = [];
    const file = parse(fs.readFileSync(config, 'utf-8'), errors, { allowTrailingComma: true }) as {
        kv_namespaces?: { binding: string }[];
        vars?: Record<string, any>;
        [key: string]: any;
    };
    if (errors.length > 0) {
        const detail = errors.map(e => `${printParseErrorCode(e.error)} at offset ${e.offset}`).join(', ');
        throw new Error(`Invalid JSONC config ${config}: ${detail}`);
    }
    for (const kv of file.kv_namespaces || []) {
        if (!Object.prototype.hasOwnProperty.call(env, kv.binding)) {
            throw new Error(`Missing kv_namespaces: ${kv.binding}`);
        }
    }
    env = { ...env, ...file.vars };
    return env;
}
