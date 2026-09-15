import type { Ai, WorkersAIBinding } from '@chatgpt-telegram-workers/types';
import type { WorkersImageMultipartInput, WorkersImageParams } from './types';

/**
 * 编译期契约:真实的 `env.AI`(官方 `Ai` 类型)必须能直接当作 `WorkersAIBinding`
 * 使用。若官方类型新增必填成员、或我们改成不兼容的结构,这里的断言会直接编译失败,
 * 而不是等运行时才发现注入的绑定不匹配。
 *
 * 纯类型断言,不产生运行时求值。
 */
type AssertAssignable<T extends U, U> = T;
type _AiSatisfiesBinding = AssertAssignable<Ai, WorkersAIBinding>;

/** 扁平参数与 multipart 信封都必须能作为图片输入 */
type ImageInput = WorkersImageParams | WorkersImageMultipartInput;
type _FlatIsImageInput = AssertAssignable<WorkersImageParams, ImageInput>;
type _EnvelopeIsImageInput = AssertAssignable<WorkersImageMultipartInput, ImageInput>;

/**
 * `Ai.run` 是重载方法,手写桩对象无法用普通函数满足,统一经由该 helper 构造,
 * 避免每个测试各自散落 `as any`。
 */
function stubBinding(impl: (model: string, body: unknown) => Promise<unknown>): WorkersAIBinding {
    return { run: impl } as unknown as WorkersAIBinding;
}

describe('Workers binding contract', () => {
    it('models() 是可选的:只有 run() 的绑定也能注入', () => {
        const legacy = stubBinding(async () => ({ response: 'ok' }));
        expect(legacy.models).toBeUndefined();
        expect(typeof legacy.run).toBe('function');
    });

    it('同时提供 run() 与 models() 的绑定可用', async () => {
        const full: WorkersAIBinding = {
            ...stubBinding(async () => ({ image: 'QUJD' })),
            models: async () => [{ name: '@cf/meta/llama-3-8b-instruct' }],
        };
        expect(await full.models!({ task: 'Text Generation' })).toEqual([{ name: '@cf/meta/llama-3-8b-instruct' }]);
    });
});
