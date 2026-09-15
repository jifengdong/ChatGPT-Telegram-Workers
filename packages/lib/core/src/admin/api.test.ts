import { ENV } from '@chatgpt-telegram-workers/config';
import { createSession } from './auth';
import { createAdminMethods } from './api';

const BOT_TOKEN = '123456:API-TEST';
const ADMIN_ID = '42';

function ctxWith(token: string): { request: Request; env: unknown } {
    return {
        request: new Request('https://example.test/rpc', { headers: { Authorization: `Bearer ${token}` } }),
        env: {},
    };
}

describe('admin RPC', () => {
    beforeEach(() => {
        ENV.TELEGRAM_TOKEN = BOT_TOKEN;
        ENV.ADMIN_ID = ADMIN_ID;
        ENV.AI_BINDING = null as any;
    });

    afterEach(() => {
        ENV.TELEGRAM_TOKEN = '';
        ENV.ADMIN_ID = '';
        ENV.AI_BINDING = null as any;
    });

    it('reports workersBinding=false when no AI binding is present', async () => {
        const methods = createAdminMethods();
        const token = await createSession(ADMIN_ID);
        const meta = (await methods['admin.meta']({}, ctxWith(token))) as { workersBinding: boolean };
        expect(meta.workersBinding).toBe(false);
    });

    it('reports workersBinding=true when ENV.AI_BINDING is set', async () => {
        ENV.AI_BINDING = { run: vi.fn() } as any;
        const methods = createAdminMethods();
        const token = await createSession(ADMIN_ID);
        const meta = (await methods['admin.meta']({}, ctxWith(token))) as { workersBinding: boolean };
        expect(meta.workersBinding).toBe(true);
    });

    it('passes the AI binding to workers model listing', async () => {
        const models = vi.fn().mockResolvedValue([{ name: '@cf/meta/llama-3-8b-instruct' }]);
        ENV.AI_BINDING = { run: vi.fn(), models } as any;
        const methods = createAdminMethods();
        const token = await createSession(ADMIN_ID);
        const result = (await methods['admin.models'](
            {
                kind: 'chat',
                provider: {
                    id: 'w',
                    protocol: 'workers',
                    baseUrl: '',
                    apiKey: '',
                    model: '',
                    models: [],
                    options: {},
                    label: '',
                    enabled: true,
                    hasApiKey: false,
                    extraParams: {},
                    clearApiKey: false,
                },
            },
            ctxWith(token),
        )) as { models: string[] };
        expect(result.models).toEqual(['@cf/meta/llama-3-8b-instruct']);
        // 有绑定时不需要 accountId/token,凭据字段为空也能列出模型
        expect(models).toHaveBeenCalledWith({ task: 'Text Generation', per_page: 100 });
    });
});
