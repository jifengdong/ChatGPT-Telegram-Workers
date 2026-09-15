import type { ImageProtocol } from './protocols';
import type { WorkersAIBinding } from './types';
import { generateWorkersImage } from './workers-ai';

/** 图片生成客户端:统一返回远程 URL(openai 系)或 Blob(workers) */
export interface ImageClient<P extends ImageProtocol = ImageProtocol> {
    readonly protocol: P;
    generate: (prompt: string) => Promise<string | Blob>;
}

/** createImageClient 的配置,由调用方从 provider 组装 */
export interface ImageClientConfig {
    model: string;
    apiKey?: string;
    baseUrl?: string;
    fetch?: typeof fetch;
    /** 协议与模型专属的生成参数,合并进请求体(provider 级配置) */
    extraParams?: Record<string, unknown>;
    /** workers 协议:优先使用的绑定 */
    binding?: WorkersAIBinding;
    /** workers 协议:无绑定时的 REST 凭据 */
    accountId?: string;
}

/**
 * OpenAI Images 协议:POST {base}/images/generations,返回 data[0].url。
 * `extraParams` 原样合并进请求体,`prompt`/`n`/`model` 由代码固定,不被覆盖。
 */
async function generateOpenAIImage(config: ImageClientConfig, prompt: string): Promise<string> {
    const base = (config.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const body: Record<string, unknown> = {
        ...config.extraParams,
        prompt,
        n: 1,
        model: config.model,
    };
    const doFetch = config.fetch || fetch;
    const response = await doFetch(`${base}/images/generations`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
        },
        body: JSON.stringify(body),
    });
    const data: any = await response.json();
    if (data?.error?.message) {
        throw new Error(data.error.message);
    }
    const url = data?.data?.at(0)?.url;
    if (typeof url !== 'string' || !url) {
        throw new Error('Image generation returned no url');
    }
    return url;
}

/** 按协议创建图片生成客户端 */
export function createImageClient<P extends ImageProtocol>(protocol: P, config: ImageClientConfig): ImageClient<P> {
    if (protocol === 'workers') {
        return {
            protocol,
            generate: (prompt: string) =>
                generateWorkersImage({
                    model: config.model,
                    prompt,
                    extraParams: config.extraParams,
                    binding: config.binding,
                    accountId: config.accountId,
                    apiKey: config.apiKey,
                    fetch: config.fetch,
                }),
        } as ImageClient<P>;
    }
    return {
        protocol,
        generate: (prompt: string) => generateOpenAIImage(config, prompt),
    } as ImageClient<P>;
}
