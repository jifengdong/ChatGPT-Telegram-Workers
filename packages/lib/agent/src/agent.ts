import type { AppConfig, ChatProviderConfig, ImageProviderConfig } from '@chatgpt-telegram-workers/config';
import type { ChatAgent, ImageAgent } from './types';
import { createChatAgent, createImageAgent } from './providers';
import { createWorkersChat, createWorkersImage } from './workersai';

export function buildChatAgents(config: AppConfig): ChatAgent[] {
    return config.chatProviders
        .filter(provider => provider.enabled)
        .map(provider =>
            provider.protocol === 'workers'
                ? createWorkersChat(provider, config.settings)
                : createChatAgent(provider.protocol, provider, config.settings),
        )
        .filter((agent): agent is ChatAgent => agent !== null);
}

export function buildImageAgents(config: AppConfig): ImageAgent[] {
    return config.imageProviders
        .filter(provider => provider.enabled)
        .map(provider => (provider.protocol === 'workers' ? createWorkersImage(provider) : createImageAgent(provider)))
        .filter((agent): agent is ImageAgent => agent !== null);
}

/** 按 defaultChatProvider 选择,否则取首个可用 */
export function loadChatLLM(config: AppConfig): ChatAgent | null {
    const agents = buildChatAgents(config);
    if (config.defaultChatProvider) {
        const found = agents.find(agent => agent.name === config.defaultChatProvider);
        if (found) {
            return found;
        }
    }
    return agents.at(0) ?? null;
}

/** 按 defaultImageProvider 选择,否则取首个可用 */
export function loadImageGen(config: AppConfig): ImageAgent | null {
    const agents = buildImageAgents(config);
    if (config.defaultImageProvider) {
        const found = agents.find(agent => agent.name === config.defaultImageProvider);
        if (found) {
            return found;
        }
    }
    return agents.at(0) ?? null;
}

export type { ChatProviderConfig, ImageProviderConfig };
