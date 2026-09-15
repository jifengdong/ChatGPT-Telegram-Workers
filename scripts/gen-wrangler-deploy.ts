import * as fs from 'node:fs/promises';
import { parse, type ParseError } from 'jsonc-parser';

/**
 * Generates the gitignored wrangler.deploy.jsonc for Cloudflare Workers Builds:
 * - starts from the tracked wrangler.jsonc, which holds `local` placeholders instead of real ids;
 * - each id resolves in order: DEPLOY_* build variable first, then a real id already present
 *   in the config (handy when you edit real ids locally without committing them);
 * - `local` (or empty) means "not configured" and fails the deploy with a CI-friendly error;
 * - vars are removed: credentials are managed in the dashboard (Settings -> Variables and
 *   Secrets), and keep_vars keeps them intact across deploys.
 *
 * Required: DEPLOY_KV_NAMESPACE_ID
 * Optional: DEPLOY_KV_PREVIEW_NAMESPACE_ID, DEPLOY_WORKER_NAME
 */

const BASE_CONFIG_PATH = 'wrangler.jsonc';
const DEPLOY_CONFIG_PATH = 'wrangler.deploy.jsonc';

interface WranglerConfig {
    name?: string;
    keep_vars?: boolean;
    kv_namespaces?: { binding: string; id?: string; preview_id?: string }[];
    vars?: Record<string, unknown>;
    [key: string]: unknown;
}

function fail(message: string): never {
    console.error(`[gen-wrangler-deploy] ${message}`);
    process.exit(1);
}

/** `local` is the wrangler dev placeholder for "not configured". */
function isPlaceholder(value?: string): boolean {
    return !value || value === 'local';
}

async function loadBaseConfig(): Promise<WranglerConfig> {
    const errors: ParseError[] = [];
    const config = parse(await fs.readFile(BASE_CONFIG_PATH, 'utf-8'), errors, {
        allowTrailingComma: true,
    }) as WranglerConfig | undefined;
    if (errors.length > 0 || !config || typeof config !== 'object') {
        fail(`failed to read ${BASE_CONFIG_PATH}: invalid JSONC`);
    }
    return config;
}

async function main() {
    const config = await loadBaseConfig();

    // vars are managed in the dashboard to avoid overwriting console values with repo placeholders
    const strippedVars = Object.keys(config.vars ?? {});
    delete config.vars;
    config.keep_vars = true;

    // Resolve the DATABASE id: DEPLOY_* build variable first, then the config value.
    const configId = config.kv_namespaces?.find(item => item.binding === 'DATABASE')?.id;
    const kvNamespaceId = process.env.DEPLOY_KV_NAMESPACE_ID || configId;
    if (isPlaceholder(kvNamespaceId)) {
        // This message is read from a CI log, so name the fix and show which
        // DEPLOY_* variables did arrive (names only) to point at the missing one.
        const seen = Object.keys(process.env)
            .filter(key => key.startsWith('DEPLOY_'))
            .toSorted();
        fail(
            'DEPLOY_KV_NAMESPACE_ID is required (or set a real kv_namespaces DATABASE id in wrangler.jsonc).\n' +
                ' On Cloudflare Workers Builds, add it under Settings -> Build variables.\n' +
                (seen.length > 0
                    ? ` DEPLOY_* variables currently set: ${seen.join(', ')}`
                    : ' No DEPLOY_* variables are set in this environment.'),
        );
    }
    const previewId = process.env.DEPLOY_KV_PREVIEW_NAMESPACE_ID || kvNamespaceId;

    // Only replace DATABASE, keep other bindings from the config (e.g. AI).
    const others = (config.kv_namespaces ?? []).filter(item => item.binding !== 'DATABASE');
    config.kv_namespaces = [{ binding: 'DATABASE', id: kvNamespaceId, preview_id: previewId }, ...others];

    if (process.env.DEPLOY_WORKER_NAME) {
        config.name = process.env.DEPLOY_WORKER_NAME;
    }

    await fs.writeFile(DEPLOY_CONFIG_PATH, `${JSON.stringify(config, null, 4)}\n`);
    const parts = [`DATABASE -> ${kvNamespaceId}`];
    if (config.name) {
        parts.push(`name -> ${config.name}`);
    }
    if (strippedVars.length > 0) {
        parts.push(`vars removed from config: ${strippedVars.join(', ')}`);
    }
    console.log(`Generated ${DEPLOY_CONFIG_PATH}: ${parts.join('; ')}`);
}

main();
