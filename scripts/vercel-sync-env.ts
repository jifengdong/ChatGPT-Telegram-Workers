import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import { parse } from 'jsonc-parser';

/** 通过 `command -v` 判断命令是否在 PATH 上(不依赖 shell 特定的 which 实现) */
function which(bin: string): boolean {
    try {
        execSync(`command -v ${bin}`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

async function main() {
    const {
        WRANGLER_PATH = 'wrangler.jsonc',
        VERCEL_ENV = 'production',
        // vercel CLI 不作为仓库依赖安装,用全局命令(或通过 VERCEL_BIN 指向自定义路径)
        VERCEL_BIN = 'vercel',
    } = process.env;

    if (!which(VERCEL_BIN)) {
        throw new Error(
            `找不到 Vercel CLI(${VERCEL_BIN})。它不在本仓库依赖中,请先安装:\n` +
                '  npm i -g vercel\n' +
                '或指定路径:VERCEL_BIN=/path/to/vercel pnpm run vercel:syncenv',
        );
    }

    const envs = execSync(`${VERCEL_BIN} env ls ${VERCEL_ENV}`, { encoding: 'utf-8' })
        .trim()
        .split('\n')
        .map(l => l.trim())
        .slice(1)
        .map(l => l.split(/\s+/)[0])
        .map(l => l.replace(/[^\x20-\x7E]/g, '').replace(/\[\d+m/g, ''));
    const usedKeys = new Set<string>();
    usedKeys.add('UPSTASH_REDIS_REST_URL');
    usedKeys.add('UPSTASH_REDIS_REST_TOKEN');
    const { vars = {} } = parse(await fs.readFile(WRANGLER_PATH, 'utf-8'), undefined, {
        allowTrailingComma: true,
    });
    for (const [key, value] of Object.entries(vars)) {
        try {
            usedKeys.add(key);
            execSync(`${VERCEL_BIN} env add ${key} ${VERCEL_ENV} --force`, {
                input: `${value}`,
                encoding: 'utf-8',
            });
        } catch (e) {
            console.error(e);
        }
    }
    for (const key of envs) {
        if (!usedKeys.has(key)) {
            console.log(
                `Keep ${key}: not declared in ${WRANGLER_PATH}. Vercel variables are managed in the dashboard; remove it manually if unneeded.`,
            );
        }
    }
}

main().catch(console.error);
