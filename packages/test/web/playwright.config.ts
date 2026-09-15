import { defineConfig, devices } from '@playwright/test';

/**
 * 浏览器端 e2e:在真实无头浏览器里驱动管理后台(/admin)、/init 与 /interpolate,
 * 后端用 `packages/test/mocks` 的 mock Telegram + mock LLM,不需要任何外部网络或 Telegram 登录。
 *
 * 浏览器选择:
 * - 默认使用系统安装的 Chrome(`channel: 'chrome'`);
 * - 只装了 Playwright 自带浏览器时,设 `PW_CHANNEL=` (空)并先运行
 *   `pnpm --filter @chatgpt-telegram-workers/test-web install:browser`。
 */
const channel = process.env.PW_CHANNEL === undefined ? 'chrome' : process.env.PW_CHANNEL || undefined;

export default defineConfig({
    testDir: './tests',
    timeout: 60_000,
    expect: { timeout: 10_000 },
    fullyParallel: false,
    workers: 1,
    retries: 0,
    reporter: [['list']],
    use: {
        ...devices['Desktop Chrome'],
        ...(channel ? { channel } : {}),
        headless: true,
        trace: 'retain-on-failure',
    },
});
