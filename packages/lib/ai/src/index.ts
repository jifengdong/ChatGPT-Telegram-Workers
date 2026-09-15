import type { ClientConfig, LLMClient, Protocol } from './types';
import { AnthropicMessagesClient } from './anthropic-messages';
import { ChatCompletionsClient } from './chat-completions';
import { ResponsesClient } from './responses';
import { WorkersAIClient } from './workers-ai';

export { AnthropicMessagesClient } from './anthropic-messages';
export { ChatCompletionsClient } from './chat-completions';
export { ResponsesClient } from './responses';
export {
    generateWorkersImage,
    WorkersAIClient,
    workersApiBaseUrl,
    workersChatBaseUrl,
    workersImageRunUrl,
    workersImageToBlob,
    parseWorkersSSE,
    workersCredentials,
    type WorkersImageOptions,
} from './workers-ai';
export { createImageClient, type ImageClient, type ImageClientConfig } from './images';
export {
    CHAT_PROTOCOLS,
    IMAGE_PROTOCOLS,
    chatImageSupport,
    imageAdaptMode,
    findChatProtocol,
    findImageProtocol,
    isChatProtocol,
    isImageProtocol,
    type ChatProtocol,
    type ImageProtocol,
    type ImageSupport,
    type ModelListKind,
    type ProtocolOption,
    type ProviderField,
} from './protocols';
export { fetchModels, type ModelSource, type ProviderKind } from './models';
export { iterSSEMessages, type SSEMessage } from './sse';
export * from './types';

export function createClient(protocol: Protocol, config: ClientConfig = {}): LLMClient {
    switch (protocol) {
        case 'anthropic-messages':
            return new AnthropicMessagesClient(config);
        case 'chat-completions':
            return new ChatCompletionsClient(config);
        case 'responses':
            return new ResponsesClient(config);
        case 'workers':
            return new WorkersAIClient(config);
        default:
            throw new Error(`Unknown protocol: ${protocol}`);
    }
}
