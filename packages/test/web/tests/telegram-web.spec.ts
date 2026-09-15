import { expect, test } from '@playwright/test';
import { ADMIN_ID, disposeHarness, getHarness } from './harness';

/**
 * 通过「模拟的 Telegram Web 客户端」在浏览器里像真人一样操作 bot:
 * 打开聊天、发消息、看到回复、点内联按钮。全程离线,不需要真实 Telegram。
 */

test.describe.configure({ mode: 'serial' });

const WHITELIST_USER = 2002;
const GROUP_ID = -100777;

test.afterAll(async () => {
    await disposeHarness();
});

test('user sends a private message in the mock web client and gets a reply', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({
        settings: { allowedUserIds: [`${WHITELIST_USER}`], streamMode: false },
    });

    // 预置一个私聊会话
    harness.web.addChat({
        id: WHITELIST_USER,
        type: 'private',
        title: 'Alice',
        userId: WHITELIST_USER,
        userName: 'Alice',
    });

    await page.goto(`${harness.webUrl}/web`);
    await expect(page.locator('#sidebar button', { hasText: 'Alice' })).toBeVisible();

    await page.fill('input[name="text"]', 'hello from the browser');
    await page.click('button[type="submit"]');

    // bot 的回复出现在聊天记录里
    await expect(page.locator('#log .msg.bot', { hasText: 'Hello from the mock LLM!' })).toBeVisible();
});

test('user clicks an inline keyboard button from the web client', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({
        settings: { allowedUserIds: [`${ADMIN_ID}`], streamMode: false },
        chatProviders: [
            {
                id: 'mock-chat',
                baseUrl: `${harness.llmUrl}/v1`,
                model: 'mock-model',
                models: ['mock-model', 'mock-model-2'],
            },
        ],
    });
    harness.web.addChat({ id: ADMIN_ID, type: 'private', title: 'Admin', userId: ADMIN_ID, userName: 'Admin' });

    await page.goto(`${harness.webUrl}/web`);
    // 切到 Admin 会话(若有多个)
    await page.locator('#sidebar button', { hasText: 'Admin' }).first().click();

    // 发 /models:第一步先选 provider
    await page.fill('input[name="text"]', '/models');
    await page.click('button[type="submit"]');

    const providerButton = page.locator('#keyboard button', { hasText: 'mock-chat' });
    await expect(providerButton).toBeVisible({ timeout: 15_000 });
    await providerButton.click();

    // 第二步:provider 的模型列表,点第二个模型
    const button = page.locator('#keyboard button', { hasText: 'mock-model-2' });
    await expect(button).toBeVisible({ timeout: 15_000 });
    await button.click();

    await expect
        .poll(
            async () =>
                (await harness.botClient.getConfig()).chatProviders.find((p: any) => p.id === 'mock-chat')?.model,
        )
        .toBe('mock-model-2');
});

test('group chat requires an @mention and replies visibly', async ({ page }) => {
    const harness = await getHarness();
    await harness.applyConfig({
        settings: {
            allowedGroupIds: [`${GROUP_ID}`],
            allowedUserIds: [`${ADMIN_ID}`],
            groupChatBotShareMode: false,
            streamMode: false,
        },
    });
    harness.web.addChat({ id: GROUP_ID, type: 'supergroup', title: 'Team', userId: ADMIN_ID, userName: 'Admin' });

    await page.goto(`${harness.webUrl}/web`);
    await page.locator('#sidebar button', { hasText: 'Team' }).first().click();

    // 不带 @mention:不应回复
    await page.fill('input[name="text"]', 'just chatting');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(1500);
    await expect(page.locator('#log .msg.bot', { hasText: 'Hello from the mock LLM!' })).toHaveCount(0);

    // 带 @mention:应当回复
    await page.fill('input[name="text"]', 'hey @e2e_bot are you there');
    await page.click('button[type="submit"]');
    await expect(page.locator('#log .msg.bot', { hasText: 'Hello from the mock LLM!' })).toBeVisible({
        timeout: 15_000,
    });
});

test('unauthorized user is rejected in the web client', async ({ page }) => {
    const harness = await getHarness();
    const strangerId = 9999;
    await harness.applyConfig({ settings: { allowedUserIds: [`${ADMIN_ID}`], streamMode: false } });
    harness.web.addChat({
        id: strangerId,
        type: 'private',
        title: 'Stranger',
        userId: strangerId,
        userName: 'Stranger',
    });

    await page.goto(`${harness.webUrl}/web`);
    await page.locator('#sidebar button', { hasText: 'Stranger' }).first().click();
    await page.fill('input[name="text"]', 'let me in');
    await page.click('button[type="submit"]');

    // bot 回的是白名单提示,而不是 LLM 回复
    await expect(page.locator('#log .msg.bot', { hasText: 'white list' })).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#log .msg.bot', { hasText: 'Hello from the mock LLM!' })).toHaveCount(0);
});
