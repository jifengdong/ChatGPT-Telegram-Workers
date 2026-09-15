import { expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, BOT_TOKEN, disposeHarness, getHarness, stubTelegramWebApp } from './harness';

/**
 * 管理后台(/admin)浏览器端 e2e:真实无头浏览器 + mock 后端,覆盖密码登录、
 * Mini App initData 登录、设置保存、provider 编辑、/init 绑定与 /interpolate 预览。
 */

test.describe.configure({ mode: 'serial' });

test.afterAll(async () => {
    await disposeHarness();
});

test('password login renders the admin shell', async ({ page }) => {
    const harness = await getHarness();
    await page.goto(`${harness.baseUrl}/admin`);

    await expect(page.locator('admin-login')).toBeVisible();
    await page.fill('#pwd', ADMIN_PASSWORD);
    await page.click('#login');

    // 登录成功后挂载 admin-app 外壳:底部标签栏 + 默认 providers 页
    await expect(page.locator('.tabbar .tab-btn')).toHaveCount(5);
    await expect(page.locator('.page-root[data-tab="providers"]')).toBeVisible();
    // Save 悬浮按钮只在 Settings 与详情页出现,列表页应隐藏
    await expect(page.locator('[data-save]')).toBeHidden();
});

test('Mini App initData logs in without a password', async ({ page }) => {
    const harness = await getHarness();
    await stubTelegramWebApp(page);
    await page.goto(`${harness.baseUrl}/admin`);
    // 不应出现密码输入框,而是直接进入外壳
    await expect(page.locator('.tabbar .tab-btn')).toHaveCount(5);
    await expect(page.locator('#pwd')).toHaveCount(0);
});

test('toggles and saves settings through grouped sub-pages', async ({ page }) => {
    const harness = await getHarness();
    await page.goto(`${harness.baseUrl}/admin`);
    await page.fill('#pwd', ADMIN_PASSWORD);
    await page.click('#login');
    await expect(page.locator('.tabbar .tab-btn')).toHaveCount(5);

    // 切到 Settings:根页是分组菜单,点分组 push 进入子页
    await page.click('.tab-btn[data-tab="settings"]');
    const settingsRoot = page.locator('.page-root[data-tab="settings"]');
    await expect(settingsRoot.locator('[data-goto="general"]')).toBeVisible();

    // General 子页:设置公开地址
    await settingsRoot.locator('[data-goto="general"]').click();
    await expect(page.locator('settings-detail')).toBeVisible();
    await page.fill('[data-key="publicBaseUrl"]', 'https://example.test');
    await page.click('[data-back]');
    await expect(page.locator('settings-detail')).toHaveCount(0);

    // Access Control 子页:允许所有用户
    await settingsRoot.locator('[data-goto="access"]').click();
    const allowAll = page.locator('[data-key="allowAllUsers"]');
    await expect(allowAll).toBeVisible();
    await expect(allowAll).not.toBeChecked();
    await allowAll.check();
    await page.click('[data-back]');
    await expect(page.locator('settings-detail')).toHaveCount(0);

    await page.click('[data-save]');

    // 通过 RPC 断言已持久化
    await expect.poll(async () => (await harness.botClient.getConfig()).settings.allowAllUsers).toBe(true);
    const saved = await harness.botClient.getConfig();
    expect(saved.settings.publicBaseUrl).toBe('https://example.test');

    // 还原,避免影响后续用例
    await settingsRoot.locator('[data-goto="access"]').click();
    await page.locator('[data-key="allowAllUsers"]').uncheck();
    await page.click('[data-back]');
    await page.click('[data-save]');
    await expect.poll(async () => (await harness.botClient.getConfig()).settings.allowAllUsers).toBe(false);
});

test('adds and removes allowed user IDs as a list', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({ settings: { allowAllUsers: false, allowedUserIds: [], allowedGroupIds: [] } });

    await login(page, harness.baseUrl);
    await page.click('.tab-btn[data-tab="settings"]');
    const settingsRoot = page.locator('.page-root[data-tab="settings"]');
    await settingsRoot.locator('[data-goto="access"]').click();
    await expect(page.locator('settings-detail')).toBeVisible();

    // 通过“Add User ID”行内表单添加两个 ID
    await page.click('[data-list-add="allowedUserIds"]');
    await page.fill('[data-list-input="allowedUserIds"]', '111111');
    await page.click('[data-list-confirm="allowedUserIds"]');
    await expect(page.locator('[data-list-remove="allowedUserIds"][data-value="111111"]')).toBeVisible();

    await page.click('[data-list-add="allowedUserIds"]');
    await page.fill('[data-list-input="allowedUserIds"]', '222222');
    await page.click('[data-list-confirm="allowedUserIds"]');
    await expect(page.locator('[data-list-remove="allowedUserIds"][data-value="222222"]')).toBeVisible();

    // 删除第一个 ID
    await page.click('[data-list-remove="allowedUserIds"][data-value="111111"]');
    await expect(page.locator('[data-list-remove="allowedUserIds"][data-value="111111"]')).toHaveCount(0);

    // 返回触发自动保存
    await page.click('[data-back]');
    await expect.poll(async () => (await harness.botClient.getConfig()).settings.allowedUserIds).toEqual(['222222']);

    // 还原全局配置,避免影响后续用例
    await harness.applyConfig({ settings: { allowedUserIds: [] } });
});

test('edits a provider model through the detail form and saves', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({
        settings: { allowedUserIds: [] },
        chatProviders: [
            {
                id: 'mock-chat',
                baseUrl: `${harness.llmUrl}/v1`,
                model: 'mock-model',
                models: ['mock-model', 'mock-model-2'],
            },
        ],
    });

    await page.goto(`${harness.baseUrl}/admin`);
    await page.fill('#pwd', ADMIN_PASSWORD);
    await page.click('#login');
    await expect(page.locator('.tabbar .tab-btn')).toHaveCount(5);
    await page.click('.tab-btn[data-tab="providers"]');

    // 打开 provider 详情
    await page.click('[data-edit="mock-chat"]');
    await expect(page.locator('provider-form')).toBeVisible();
    // 选择第二个模型作为默认
    await page.click('[data-pick-model="mock-model-2"]');
    // 返回触发自动保存 + Save
    await page.click('[data-back]');
    await page.click('[data-save]');

    await expect
        .poll(
            async () =>
                (await harness.botClient.getConfig()).chatProviders.find((p: any) => p.id === 'mock-chat')?.model,
        )
        .toBe('mock-model-2');
});

test('/init binds the webhook from the browser', async ({ page }) => {
    const harness = await getHarness();
    // 先通过 /admin 登录,令牌写入 localStorage,随后 /init 复用同一会话
    await page.goto(`${harness.baseUrl}/admin`);
    await page.fill('#pwd', ADMIN_PASSWORD);
    await page.click('#login');
    await expect(page.locator('.tabbar .tab-btn')).toHaveCount(5);

    await page.goto(`${harness.baseUrl}/init`);
    await expect(page.locator('page-init')).toBeVisible();
    // 页面加载即自动调用 init.bind
    await expect(page.locator('#status-title')).toContainText(/Webhook bound successfully|Binding finished/);
    expect(harness.telegram.webhook).toBe(`${harness.baseUrl}/telegram/${BOT_TOKEN}/webhook`);
});

test('/interpolate renders the template preview', async ({ page }) => {
    const harness = await getHarness();
    await page.goto(`${harness.baseUrl}/interpolate`);

    const preview = page.locator('#preview');
    await expect(preview).toBeVisible();
    await expect(preview).toContainText('google.com');
    await expect(preview).toContainText('172.217.24.110');

    // 编辑模板 + 数据会实时更新预览
    await page.fill('#template', 'Status is {{Status}}');
    await page.fill('#data', JSON.stringify({ Status: 7 }));
    await expect(preview).toHaveText('Status is 7');

    // 非法 JSON 显示错误而不是崩溃
    await page.fill('#data', '{not json');
    await expect(preview.locator('.error')).toBeVisible();
});

test('home page renders deploy info and navigates to admin', async ({ page }) => {
    const harness = await getHarness();
    await page.goto(`${harness.baseUrl}/`);
    await expect(page.locator('page-home')).toBeVisible();
    await expect(page.locator('#admin-link')).toBeVisible();
    await expect(page.locator('text=Deployed successfully')).toBeVisible();
});

test('adds a provider, fetches models from the endpoint, and saves', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({ chatProviders: [] });

    await login(page, harness.baseUrl);
    await page.click('.tab-btn[data-tab="providers"]');
    const providers = page.locator('.page-root[data-tab="providers"]');
    await providers.locator('[data-add]').click();
    await expect(page.locator('provider-form')).toBeVisible();

    // 填写端点与 Key
    await page.fill('input[data-field="label"]', 'Browser Provider');
    await page.fill('input[data-field="baseUrl"]', `${harness.llmUrl}/v1`);
    await page.fill('input[data-field="apiKey"]', 'sk-browser');

    // 手动加一个模型
    await page.click('[data-add-model]');
    await page.fill('[data-model-input]', 'manual-model');
    await page.click('[data-confirm-model]');

    // 从端点拉取模型列表(会走 admin.models → mock /v1/models)
    await page.click('[data-fetch-models]');
    await expect(page.locator('text=/\\d+ found/')).toBeVisible();
    await page.click('[data-add-all-fetched]');
    await expect(page.locator('[data-pick-model="mock-model"]')).toBeVisible();

    // 选中拉取到的模型作为默认,返回并保存
    await page.click('[data-pick-model="mock-model"]');
    await page.click('[data-back]');
    await page.click('[data-save]');

    const saved = (await harness.botClient.getConfig()).chatProviders;
    const added = saved.find((p: any) => p.label === 'Browser Provider');
    expect(added).toBeTruthy();
    expect(added.model).toBe('mock-model');
    expect(added.models).toEqual(expect.arrayContaining(['manual-model', 'mock-model', 'mock-model-2']));
});

test('creates a plugin and a custom command, then deletes the plugin', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({ plugins: [], customCommands: [] });

    await login(page, harness.baseUrl);

    // 插件
    await page.click('.tab-btn[data-tab="plugins"]');
    const pluginsPage = page.locator('.page-root[data-tab="plugins"]');
    await pluginsPage.locator('[data-add]').click();
    await expect(page.locator('item-form')).toBeVisible();
    await page.fill('input[data-field="command"]', '/browserping');
    await page.fill('input[data-field="description"]', 'browser plugin');
    await page.fill('textarea[data-field-content]', '{"url":"https://example.test","method":"GET"}');
    await page.click('[data-scope="all_private_chats"]');
    await page.click('[data-back]');
    await page.click('[data-save]');
    await expect.poll(async () => (await harness.botClient.getConfig()).plugins.length).toBe(1);
    const plugin = (await harness.botClient.getConfig()).plugins[0];
    expect(plugin.command).toBe('/browserping');
    expect(plugin.scope).toContain('all_private_chats');

    // 自定义命令
    await page.click('.tab-btn[data-tab="commands"]');
    const commandsPage = page.locator('.page-root[data-tab="commands"]');
    await commandsPage.locator('[data-add]').click();
    await expect(page.locator('item-form')).toBeVisible();
    await page.fill('input[data-field="command"]', '/alias');
    await page.fill('textarea[data-field-content]', '/help');
    await page.click('[data-back]');
    await page.click('[data-save]');
    await expect.poll(async () => (await harness.botClient.getConfig()).customCommands.length).toBe(1);

    // 删除插件(二次确认);删除后表单自行关闭,pop 事件触发自动保存
    await page.click('.tab-btn[data-tab="plugins"]');
    await pluginsPage.locator('[data-edit]').click();
    await expect(page.locator('item-form')).toBeVisible();
    await page.click('[data-remove]');
    await page.click('[data-remove]'); // 第二次点击确认
    await expect(page.locator('item-form')).toBeHidden();
    await expect.poll(async () => (await harness.botClient.getConfig()).plugins.length).toBe(0);
});

test('never exposes the stored key and only clears it explicitly', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({
        chatProviders: [
            {
                id: 'secret-chat',
                label: 'Secret Provider',
                apiKey: 'sk-top-secret-e2e',
                model: 'mock-model',
                models: ['mock-model'],
            },
        ],
    });

    await login(page, harness.baseUrl);

    // 读取接口不下发任何密钥形态的字符串,只给出 hasApiKey
    const stored = (await harness.botClient.getConfig()).chatProviders;
    expect(stored[0].apiKey).toBe('');
    expect(stored[0].hasApiKey).toBe(true);
    expect(JSON.stringify(stored)).not.toContain('sk-top-secret-e2e');

    // 表单里 Key 输入框为空,仅用 placeholder 提示已保存
    await page.click('.tab-btn[data-tab="providers"]');
    await page.locator('.page-root[data-tab="providers"] [data-edit="secret-chat"]').click();
    const keyInput = page.locator('input[data-field="apiKey"]');
    await expect(keyInput).toHaveValue('');
    await expect(keyInput).toHaveAttribute('placeholder', 'Unchanged');

    // 不动 Key 直接保存:原 Key 必须保留
    await page.click('[data-back]');
    await page.click('[data-save]');
    await expect
        .poll(async () => (await harness.botClient.getConfig()).chatProviders.find((p: any) => p.id === 'secret-chat'))
        .toMatchObject({ hasApiKey: true, apiKey: '' });

    // 显式清除需要二次确认
    await page.locator('.page-root[data-tab="providers"] [data-edit="secret-chat"]').click();
    await page.click('[data-clear-key]');
    await expect(page.locator('[data-clear-key]')).toBeVisible(); // 第一次点击只是待确认态
    await page.click('[data-clear-key]');
    await expect(page.locator('[data-undo-clear-key]')).toBeVisible();
    await page.click('[data-back]');
    await page.click('[data-save]');
    await expect
        .poll(
            async () =>
                (await harness.botClient.getConfig()).chatProviders.find((p: any) => p.id === 'secret-chat')?.hasApiKey,
        )
        .toBe(false);
});

test('manages image providers on the Image tab', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({ imageProviders: [] });

    await login(page, harness.baseUrl);
    await page.click('.tab-btn[data-tab="image"]');
    const imagePage = page.locator('.page-root[data-tab="image"]');
    await imagePage.locator('[data-add]').click();
    await expect(page.locator('provider-form')).toBeVisible();
    await page.fill('input[data-field="label"]', 'Browser Image');
    await page.fill('input[data-field="baseUrl"]', `${harness.llmUrl}/v1`);
    await page.fill('input[data-field="apiKey"]', 'sk-img');
    // 选择 OpenAI Images 协议下的模型
    await page.click('[data-add-model]');
    await page.fill('[data-model-input]', 'dall-e-3');
    await page.click('[data-confirm-model]');
    // 生成参数按 provider 配置:经脱敏/回填后必须原样保存
    await page.fill('textarea[data-field="extraParams"]', '{"size":"1792x1024","quality":"hd"}');
    await page.click('[data-back]');
    await page.click('[data-save]');

    const images = (await harness.botClient.getConfig()).imageProviders;
    expect(images.some((p: any) => p.label === 'Browser Image' && p.model === 'dall-e-3')).toBe(true);
    expect(images.find((p: any) => p.label === 'Browser Image')?.extraParams).toEqual({
        size: '1792x1024',
        quality: 'hd',
    });
});

test('hides Base URL and API Key for workers providers', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({ chatProviders: [] });

    await login(page, harness.baseUrl);
    await page.click('.tab-btn[data-tab="providers"]');
    await page.locator('.page-root[data-tab="providers"] [data-add]').click();

    // 切到 workers 协议:Base URL / API Key 不是该协议读取的字段,必须消失
    await page.selectOption('[data-apply-protocol]', 'workers');
    await expect(page.locator('input[data-field="baseUrl"]')).toHaveCount(0);
    await expect(page.locator('input[data-field="apiKey"]')).toHaveCount(0);
    // accountId/token 才是该协议真正的凭据字段
    await expect(page.locator('input[data-opt="accountId"]')).toBeVisible();
    await expect(page.locator('input[data-opt="token"]')).toBeVisible();

    // 切回 HTTP 协议后两个字段恢复
    await page.selectOption('[data-apply-protocol]', 'chat-completions');
    await expect(page.locator('input[data-field="baseUrl"]')).toBeVisible();
    await expect(page.locator('input[data-field="apiKey"]')).toBeVisible();
});

async function login(page: import('@playwright/test').Page, baseUrl: string): Promise<void> {
    await page.goto(`${baseUrl}/admin`);
    await page.fill('#pwd', ADMIN_PASSWORD);
    await page.click('#login');
    await expect(page.locator('.tabbar .tab-btn')).toHaveCount(5);
}
