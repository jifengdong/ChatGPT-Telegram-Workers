// ../../lib/config/dist/defaults.js
var DEFAULT_SETTINGS = {
  language: "zh-cn",
  updateBranch: "master",
  publicBaseUrl: "",
  telegramApiDomain: "https://api.telegram.org",
  defaultParseMode: "Markdown",
  systemInitMessage: null,
  streamMode: true,
  chatCompleteApiTimeout: 0,
  maxOutputTokens: 0,
  telegramMinStreamInterval: 0,
  telegramPhotoSizeOffset: 1,
  telegramImageTransferMode: "base64",
  modelListColumns: 1,
  allowAllUsers: false,
  allowedUserIds: [],
  allowedGroupIds: [],
  groupChatBotEnable: true,
  groupChatBotShareMode: true,
  autoTrimHistory: true,
  maxHistoryLength: 20,
  maxTokenLength: -1,
  historyImagePlaceholder: null,
  showReplyButton: false,
  extraMessageContext: false,
  extraMessageMediaCompatible: ["image"],
  hideCommandButtons: [],
  safeMode: true,
  debugMode: false,
  devMode: false
};
var DEFAULT_CONFIG = {
  version: 1,
  defaultChatProvider: null,
  defaultImageProvider: null,
  settings: { ...DEFAULT_SETTINGS },
  chatProviders: [],
  imageProviders: [],
  plugins: [],
  customCommands: []
};
function cloneDefaultConfig() {
  return structuredClone(DEFAULT_CONFIG);
}

// ../../lib/i18n/dist/en.js
var en_default = {
  env: { system_init_message: "You are a helpful assistant" },
  command: {
    help: {
      summary: "The following commands are currently supported:\n",
      help: "Get command help",
      new: "Start a new conversation",
      start: "Get your ID and start a new conversation",
      img: "Generate an image, the complete command format is `/img image description`, for example `/img beach at moonlight`",
      version: "Get the current version number to determine whether to update",
      system: "View some system information",
      redo: "Redo the last conversation, /redo with modified content or directly /redo",
      echo: "Echo the message",
      models: "switch chat model",
      admin: "Open the admin panel (Mini App)"
    },
    new: { new_chat_start: "A new conversation has started" }
  },
  callback_query: {
    open_model_list: "Open models list",
    select_provider: "Select a provider:",
    select_model: "Choose model:",
    change_model: "Change model to ",
    back: "Back"
  }
};

// ../../lib/i18n/dist/pt.js
var pt_default = {
  env: { system_init_message: "Voc\xEA \xE9 um assistente \xFAtil" },
  command: {
    help: {
      summary: "Os seguintes comandos s\xE3o suportados atualmente:\n",
      help: "Obter ajuda sobre comandos",
      new: "Iniciar uma nova conversa",
      start: "Obter seu ID e iniciar uma nova conversa",
      img: "Gerar uma imagem, o formato completo do comando \xE9 `/img descri\xE7\xE3o da imagem`, por exemplo `/img praia ao luar`",
      version: "Obter o n\xFAmero da vers\xE3o atual para determinar se \xE9 necess\xE1rio atualizar",
      system: "Ver algumas informa\xE7\xF5es do sistema",
      redo: "Refazer a \xFAltima conversa, /redo com conte\xFAdo modificado ou diretamente /redo",
      echo: "Repetir a mensagem",
      models: "Mudar o modelo de di\xE1logo",
      admin: "Abrir o painel de administra\xE7\xE3o (Mini App)"
    },
    new: { new_chat_start: "Uma nova conversa foi iniciada" }
  },
  callback_query: {
    open_model_list: "Abra a lista de modelos",
    select_provider: "Escolha um fornecedor de modelos.:",
    select_model: "Escolha um modelo:",
    change_model: "O modelo de di\xE1logo j\xE1 foi modificado para",
    back: "Voltar"
  }
};

// ../../lib/i18n/dist/zh-hans.js
var zh_hans_default = {
  env: { system_init_message: "\u4F60\u662F\u4E00\u4E2A\u5F97\u529B\u7684\u52A9\u624B" },
  command: {
    help: {
      summary: "\u5F53\u524D\u652F\u6301\u4EE5\u4E0B\u547D\u4EE4:\n",
      help: "\u83B7\u53D6\u547D\u4EE4\u5E2E\u52A9",
      new: "\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
      start: "\u83B7\u53D6\u4F60\u7684ID, \u5E76\u53D1\u8D77\u65B0\u7684\u5BF9\u8BDD",
      img: "\u751F\u6210\u4E00\u5F20\u56FE\u7247, \u547D\u4EE4\u5B8C\u6574\u683C\u5F0F\u4E3A `/img \u56FE\u7247\u63CF\u8FF0`, \u4F8B\u5982`/img \u6708\u5149\u4E0B\u7684\u6C99\u6EE9`",
      version: "\u83B7\u53D6\u5F53\u524D\u7248\u672C\u53F7, \u5224\u65AD\u662F\u5426\u9700\u8981\u66F4\u65B0",
      system: "\u67E5\u770B\u5F53\u524D\u4E00\u4E9B\u7CFB\u7EDF\u4FE1\u606F",
      redo: "\u91CD\u505A\u4E0A\u4E00\u6B21\u7684\u5BF9\u8BDD, /redo \u52A0\u4FEE\u6539\u8FC7\u7684\u5185\u5BB9 \u6216\u8005 \u76F4\u63A5 /redo",
      echo: "\u56DE\u663E\u6D88\u606F",
      models: "\u5207\u6362\u5BF9\u8BDD\u6A21\u578B",
      admin: "\u6253\u5F00\u7BA1\u7406\u540E\u53F0 (Mini App)"
    },
    new: { new_chat_start: "\u65B0\u7684\u5BF9\u8BDD\u5DF2\u7ECF\u5F00\u59CB" }
  },
  callback_query: {
    open_model_list: "\u6253\u5F00\u6A21\u578B\u5217\u8868",
    select_provider: "\u9009\u62E9\u4E00\u4E2A\u6A21\u578B\u63D0\u4F9B\u5546:",
    select_model: "\u9009\u62E9\u4E00\u4E2A\u6A21\u578B:",
    change_model: "\u5BF9\u8BDD\u6A21\u578B\u5DF2\u4FEE\u6539\u81F3",
    back: "\u8FD4\u56DE"
  }
};

// ../../lib/i18n/dist/zh-hant.js
var zh_hant_default = {
  env: { system_init_message: "\u4F60\u662F\u4E00\u500B\u5F97\u529B\u7684\u52A9\u624B" },
  command: {
    help: {
      summary: "\u7576\u524D\u652F\u6301\u7684\u547D\u4EE4\u5982\u4E0B\uFF1A\n",
      help: "\u7372\u53D6\u547D\u4EE4\u5E6B\u52A9",
      new: "\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71",
      start: "\u7372\u53D6\u60A8\u7684ID\u4E26\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71",
      img: "\u751F\u6210\u5716\u7247\uFF0C\u5B8C\u6574\u547D\u4EE4\u683C\u5F0F\u70BA`/img \u5716\u7247\u63CF\u8FF0`\uFF0C\u4F8B\u5982`/img \u6D77\u7058\u6708\u5149`",
      version: "\u7372\u53D6\u7576\u524D\u7248\u672C\u865F\u78BA\u8A8D\u662F\u5426\u9700\u8981\u66F4\u65B0",
      system: "\u67E5\u770B\u4E00\u4E9B\u7CFB\u7D71\u4FE1\u606F",
      redo: "\u91CD\u505A\u4E0A\u4E00\u6B21\u7684\u5C0D\u8A71 /redo \u52A0\u4FEE\u6539\u904E\u7684\u5167\u5BB9 \u6216\u8005 \u76F4\u63A5 /redo",
      echo: "\u56DE\u663E\u6D88\u606F",
      models: "\u5207\u63DB\u5C0D\u8A71\u6A21\u5F0F",
      admin: "\u6253\u958B\u7BA1\u7406\u5F8C\u53F0 (Mini App)"
    },
    new: { new_chat_start: "\u958B\u59CB\u4E00\u500B\u65B0\u5C0D\u8A71" }
  },
  callback_query: {
    open_model_list: "\u6253\u958B\u6A21\u578B\u6E05\u55AE",
    select_provider: "\u9078\u64C7\u4E00\u500B\u6A21\u578B\u4F9B\u61C9\u5546:",
    select_model: "\u9078\u64C7\u4E00\u500B\u6A21\u578B:",
    change_model: "\u5C0D\u8A71\u6A21\u578B\u5DF2\u7D93\u4FEE\u6539\u81F3",
    back: "\u8FD4\u56DE"
  }
};

// ../../lib/i18n/dist/index.js
function loadI18n(lang) {
  switch (lang?.toLowerCase()) {
    case "cn":
    case "zh-cn":
    case "zh-hans":
      return zh_hans_default;
    case "zh-tw":
    case "zh-hk":
    case "zh-mo":
    case "zh-hant":
      return zh_hant_default;
    case "pt":
    case "pt-br":
      return pt_default;
    case "en":
    case "en-us":
      return en_default;
    default:
      return en_default;
  }
}

// ../../lib/config/dist/types.js
var MASKED_API_KEY = "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022";

// ../../lib/config/dist/store.js
var GLOBAL_CONFIG_KEY = "config:global";
function asString(value, fallback = "") {
  return typeof value === "string" ? value : value === null || value === void 0 ? fallback : String(value);
}
function asStringArray(value) {
  if (Array.isArray(value)) {
    return value.filter((v) => typeof v === "string");
  }
  if (typeof value === "string" && value.trim()) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
function asRecord(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}
function normalizeSettings(raw) {
  const input = asRecord(raw);
  const settings = { ...DEFAULT_SETTINGS };
  for (const key of Object.keys(DEFAULT_SETTINGS)) {
    const value = input[key];
    if (value === void 0) {
      continue;
    }
    const fallback = DEFAULT_SETTINGS[key];
    if (typeof fallback === "boolean") {
      settings[key] = value === true || value === "true";
    } else if (typeof fallback === "number") {
      const blank = value === null || value === void 0 || value === "";
      const n = blank ? Number.NaN : Number(value);
      settings[key] = Number.isFinite(n) ? n : fallback;
    } else if (Array.isArray(fallback)) {
      settings[key] = asStringArray(value);
    } else if (fallback === null) {
      settings[key] = value === null || value === void 0 || value === "" ? null : String(value);
    } else {
      settings[key] = asString(value, fallback);
    }
  }
  if (settings.telegramImageTransferMode !== "url" && settings.telegramImageTransferMode !== "base64") {
    settings.telegramImageTransferMode = DEFAULT_SETTINGS.telegramImageTransferMode;
  }
  return settings;
}
var LEGACY_CHAT_PROTOCOL = {
  openai: "chat-completions",
  mistral: "chat-completions",
  deepseek: "chat-completions",
  groq: "chat-completions",
  xai: "chat-completions",
  cohere: "chat-completions",
  azure: "chat-completions",
  gemini: "chat-completions",
  google: "chat-completions",
  "openai-compatible": "chat-completions",
  anthropic: "anthropic-messages",
  workers: "workers"
};
var LEGACY_IMAGE_PROTOCOL = {
  openai: "images",
  workers: "workers"
};
var CHAT_PROTOCOLS = ["chat-completions", "anthropic-messages", "responses", "workers"];
var IMAGE_PROTOCOLS = ["images", "workers"];
function resolveChatProtocol(raw) {
  const value = asString(raw.protocol) || asString(raw.template);
  if (!value) {
    return null;
  }
  const protocol = CHAT_PROTOCOLS.includes(value) ? value : LEGACY_CHAT_PROTOCOL[value];
  return protocol ?? null;
}
function resolveImageProtocol(raw) {
  const value = asString(raw.protocol) || asString(raw.template);
  if (!value) {
    return null;
  }
  const protocol = IMAGE_PROTOCOLS.includes(value) ? value : LEGACY_IMAGE_PROTOCOL[value];
  return protocol ?? null;
}
function normalizeModels(raw) {
  const fromArray = (value) => Array.isArray(value) ? value.filter((v) => typeof v === "string").map((v) => v.trim()).filter(Boolean) : [];
  const explicit = fromArray(raw.models);
  if (explicit.length) {
    return [...new Set(explicit)];
  }
  const legacy = asString(raw.modelsList).trim();
  if (legacy.startsWith("[")) {
    try {
      const parsed = fromArray(JSON.parse(legacy));
      if (parsed.length) {
        return [...new Set(parsed)];
      }
    } catch {
    }
  } else if (legacy && !legacy.startsWith("http")) {
    return [legacy];
  }
  const single = asString(raw.model).trim();
  return single ? [single] : [];
}
function activeModel(raw, models) {
  const model = asString(raw.model).trim();
  return model && models.includes(model) ? model : models[0] ?? "";
}
function normalizeChatProvider(raw, index) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const protocol = resolveChatProtocol(raw);
  if (!protocol) {
    return null;
  }
  const models = normalizeModels(raw);
  return {
    id: asString(raw.id) || `chat-${index + 1}`,
    protocol,
    label: asString(raw.label) || protocol,
    enabled: raw.enabled !== false,
    apiKey: asString(raw.apiKey),
    baseUrl: asString(raw.baseUrl),
    model: activeModel(raw, models),
    models,
    extraParams: asRecord(raw.extraParams),
    options: asRecord(raw.options)
  };
}
function normalizeImageProvider(raw, index) {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const protocol = resolveImageProtocol(raw);
  if (!protocol) {
    return null;
  }
  const models = normalizeModels(raw);
  return {
    id: asString(raw.id) || `image-${index + 1}`,
    protocol,
    label: asString(raw.label) || protocol,
    enabled: raw.enabled !== false,
    apiKey: asString(raw.apiKey),
    baseUrl: asString(raw.baseUrl),
    model: activeModel(raw, models),
    models,
    extraParams: asRecord(raw.extraParams),
    options: asRecord(raw.options)
  };
}
function normalizePlugin(raw, index) {
  if (!raw || typeof raw !== "object" || !raw.command) {
    return null;
  }
  return {
    id: asString(raw.id) || `plugin-${index + 1}`,
    command: asString(raw.command),
    description: asString(raw.description),
    scope: asStringArray(raw.scope),
    template: typeof raw.template === "string" ? raw.template : JSON.stringify(raw.template ?? ""),
    env: Object.fromEntries(Object.entries(asRecord(raw.env)).map(([k, v]) => [k, asString(v)])),
    enabled: raw.enabled !== false
  };
}
function normalizeCustomCommand(raw, index) {
  if (!raw || typeof raw !== "object" || !raw.command) {
    return null;
  }
  return {
    id: asString(raw.id) || `custom-${index + 1}`,
    command: asString(raw.command),
    description: asString(raw.description),
    scope: asStringArray(raw.scope),
    value: asString(raw.value),
    enabled: raw.enabled !== false
  };
}
function normalizeList(raw, fn) {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.map(fn).filter((item) => item !== null);
}
function normalizeConfig(raw) {
  const input = asRecord(raw);
  return {
    version: 1,
    defaultChatProvider: input.defaultChatProvider ? asString(input.defaultChatProvider) : null,
    defaultImageProvider: input.defaultImageProvider ? asString(input.defaultImageProvider) : null,
    settings: normalizeSettings(input.settings),
    chatProviders: normalizeList(input.chatProviders, normalizeChatProvider),
    imageProviders: normalizeList(input.imageProviders, normalizeImageProvider),
    plugins: normalizeList(input.plugins, normalizePlugin),
    customCommands: normalizeList(input.customCommands, normalizeCustomCommand)
  };
}
var SECRET_KEY_PATTERN = /token|key|secret|password|credential/i;
var NON_SECRET_OPTION_KEYS = /* @__PURE__ */ new Set(["apiKeyHeader"]);
function isSecretKey(key) {
  return !NON_SECRET_OPTION_KEYS.has(key) && SECRET_KEY_PATTERN.test(key);
}
function maskSecrets(record) {
  const masked = {};
  for (const [key, value] of Object.entries(record)) {
    masked[key] = isSecretKey(key) && typeof value === "string" && value ? MASKED_API_KEY : value;
  }
  return masked;
}
function unmaskSecrets(incoming, existing) {
  const restored = {};
  for (const [key, value] of Object.entries(incoming)) {
    restored[key] = value === MASKED_API_KEY ? existing?.[key] ?? "" : value;
  }
  return restored;
}
function maskProvider(provider) {
  return {
    id: provider.id,
    protocol: provider.protocol,
    label: provider.label,
    enabled: provider.enabled,
    hasApiKey: !!provider.apiKey,
    apiKey: "",
    baseUrl: provider.baseUrl,
    model: provider.model,
    models: provider.models,
    extraParams: provider.extraParams,
    options: maskSecrets(provider.options)
  };
}
function maskConfig(config) {
  return {
    version: 1,
    defaultChatProvider: config.defaultChatProvider,
    defaultImageProvider: config.defaultImageProvider,
    settings: config.settings,
    chatProviders: config.chatProviders.map(maskProvider),
    imageProviders: config.imageProviders.map(maskProvider),
    plugins: config.plugins.map((plugin) => ({ ...plugin, env: maskSecrets(plugin.env) })),
    customCommands: config.customCommands
  };
}
function unmaskKey(incoming, existing, clear) {
  if (clear) {
    return "";
  }
  if (!incoming || incoming === MASKED_API_KEY) {
    return existing ?? "";
  }
  return incoming;
}
function unmaskConfig(incoming, existing) {
  const chatExisting = new Map(existing.chatProviders.map((p) => [p.id, p]));
  const imageExisting = new Map(existing.imageProviders.map((p) => [p.id, p]));
  const pluginExisting = new Map(existing.plugins.map((p) => [p.id, p]));
  const unmaskProviderOptions = (provider, existingProvider) => ({
    ...provider,
    apiKey: unmaskKey(provider.apiKey, existingProvider?.apiKey, provider.clearApiKey),
    options: unmaskSecrets(provider.options, existingProvider?.options)
  });
  return normalizeConfig({
    ...incoming,
    version: 1,
    chatProviders: incoming.chatProviders.map((p) => unmaskProviderOptions(p, chatExisting.get(p.id))),
    imageProviders: incoming.imageProviders.map((p) => unmaskProviderOptions(p, imageExisting.get(p.id))),
    plugins: incoming.plugins.map((p) => ({
      ...p,
      env: unmaskSecrets(p.env, pluginExisting.get(p.id)?.env)
    }))
  });
}
var ConfigStore = class {
  database;
  ttlMs;
  cache = null;
  constructor(database, ttlMs = 5e3) {
    this.database = database;
    this.ttlMs = ttlMs;
  }
  setDatabase(database) {
    this.database = database;
  }
  async load(force = false) {
    if (!this.database) {
      return cloneDefaultConfig();
    }
    if (!force && this.cache && Date.now() - this.cache.at < this.ttlMs) {
      return this.cache.config;
    }
    let config = cloneDefaultConfig();
    try {
      const raw = await this.database.get(GLOBAL_CONFIG_KEY);
      if (raw) {
        config = normalizeConfig(typeof raw === "string" ? JSON.parse(raw) : raw);
      }
    } catch (e) {
      console.error("Failed to load config", e);
    }
    this.cache = { config, at: Date.now() };
    return config;
  }
  async save(config) {
    const normalized = normalizeConfig(config);
    await this.database.put(GLOBAL_CONFIG_KEY, JSON.stringify(normalized));
    this.cache = { config: normalized, at: Date.now() };
    return normalized;
  }
  invalidate() {
    this.cache = null;
  }
};

// ../../lib/config/dist/version.js
var BUILD_TIMESTAMP = 1789475007;
var BUILD_VERSION = "092d85a";

// ../../lib/config/dist/env.js
var Environment = class {
  BUILD_TIMESTAMP = BUILD_TIMESTAMP;
  BUILD_VERSION = BUILD_VERSION;
  TELEGRAM_TOKEN = "";
  ADMIN_ID = "";
  ADMIN_PASSWORD = "";
  TELEGRAM_SECRET_TOKEN = "";
  PUBLIC_BASE_URL = "";
  AI_BINDING = null;
  API_GUARD = null;
  DATABASE = null;
  I18N = loadI18n();
  CONFIG = cloneDefaultConfig();
  CUSTOM_MESSAGE_RENDER = null;
  store = null;
  constructor() {
    this.merge = this.merge.bind(this);
  }
  merge(source) {
    if (!source) {
      return;
    }
    if (source.AI) {
      this.AI_BINDING = source.AI;
    }
    if (source.DATABASE) {
      this.DATABASE = source.DATABASE;
    }
    if (source.API_GUARD) {
      this.API_GUARD = source.API_GUARD;
    }
    if (source.TELEGRAM_TOKEN) {
      this.TELEGRAM_TOKEN = `${source.TELEGRAM_TOKEN}`.trim();
    }
    if (source.ADMIN_ID !== void 0 && source.ADMIN_ID !== null && `${source.ADMIN_ID}` !== "") {
      this.ADMIN_ID = `${source.ADMIN_ID}`.trim();
    }
    if (source.ADMIN_PASSWORD !== void 0 && source.ADMIN_PASSWORD !== null) {
      this.ADMIN_PASSWORD = `${source.ADMIN_PASSWORD}`;
    }
    if (source.TELEGRAM_SECRET_TOKEN !== void 0 && source.TELEGRAM_SECRET_TOKEN !== null && `${source.TELEGRAM_SECRET_TOKEN}`.trim() !== "") {
      this.TELEGRAM_SECRET_TOKEN = `${source.TELEGRAM_SECRET_TOKEN}`.trim();
    }
    if (source.PUBLIC_BASE_URL !== void 0 && source.PUBLIC_BASE_URL !== null && `${source.PUBLIC_BASE_URL}`.trim() !== "") {
      this.PUBLIC_BASE_URL = `${source.PUBLIC_BASE_URL}`.trim().replace(/\/+$/, "");
    }
  }
  get publicBaseUrl() {
    return this.PUBLIC_BASE_URL || this.CONFIG.settings.publicBaseUrl || "";
  }
  getConfigStore() {
    if (!this.store) {
      this.store = new ConfigStore(this.DATABASE);
    } else {
      this.store.setDatabase(this.DATABASE);
    }
    return this.store;
  }
  async loadConfig(force = false) {
    if (!this.DATABASE) {
      return this.CONFIG;
    }
    this.CONFIG = await this.getConfigStore().load(force);
    this.I18N = loadI18n(this.CONFIG.settings.language.toLowerCase());
    return this.CONFIG;
  }
};
var ENV = new Environment();

// ../../lib/config/dist/patch.js
var LIST_KEYS = ["chatProviders", "imageProviders", "plugins", "customCommands"];
var TOP_LEVEL_KEYS = /* @__PURE__ */ new Set(["defaultChatProvider", "defaultImageProvider", "settings", ...LIST_KEYS]);
var GROUP_ADMIN_SETTINGS_KEYS = /* @__PURE__ */ new Set([
  "language",
  "defaultParseMode",
  "streamMode",
  "chatCompleteApiTimeout",
  "maxOutputTokens",
  "telegramMinStreamInterval",
  "telegramPhotoSizeOffset",
  "modelListColumns",
  "autoTrimHistory",
  "maxHistoryLength",
  "maxTokenLength",
  "showReplyButton",
  "extraMessageContext",
  "extraMessageMediaCompatible",
  "hideCommandButtons"
]);
var GROUP_ADMIN_PROVIDER_FIELDS = /* @__PURE__ */ new Set(["model", "models", "label"]);
var GROUP_ADMIN_TOP_LEVEL_KEYS = /* @__PURE__ */ new Set([
  "defaultChatProvider",
  "defaultImageProvider",
  "settings",
  "chatProviders",
  "imageProviders"
]);
function isRecord(value) {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function deepMerge(base, incoming) {
  if (!isRecord(base) || !isRecord(incoming)) {
    return incoming;
  }
  const result = { ...base };
  for (const [key, value] of Object.entries(incoming)) {
    result[key] = isRecord(value) && isRecord(result[key]) ? deepMerge(result[key], value) : value;
  }
  return result;
}
function mergeById(base, incoming) {
  if (!Array.isArray(incoming)) {
    throw new Error("Expected an array");
  }
  const result = [...base];
  for (const raw of incoming) {
    if (!isRecord(raw)) {
      continue;
    }
    const id = typeof raw.id === "string" ? raw.id : "";
    const index = id ? result.findIndex((item) => item.id === id) : -1;
    if (index >= 0) {
      result[index] = deepMerge(result[index], raw);
    } else {
      result.push(raw);
    }
  }
  return result;
}
function assertPatchAllowedFor(role, patch, base) {
  if (role === "operator") {
    return;
  }
  for (const [key, value] of Object.entries(patch)) {
    if (key === "defaultChatProvider" || key === "defaultImageProvider") {
      continue;
    }
    if (!GROUP_ADMIN_TOP_LEVEL_KEYS.has(key)) {
      throw new Error(`Config key not permitted for group admins: ${key}`);
    }
    if (key === "settings") {
      if (!isRecord(value)) {
        throw new Error("settings must be an object");
      }
      for (const settingKey of Object.keys(value)) {
        if (!GROUP_ADMIN_SETTINGS_KEYS.has(settingKey)) {
          throw new Error(`Setting not permitted for group admins: ${settingKey}`);
        }
      }
    } else if (key === "chatProviders" || key === "imageProviders") {
      if (!Array.isArray(value)) {
        throw new Error(`${key} must be an array`);
      }
      const baseList = (base?.[key] ?? []).map((p) => p.id);
      for (const item of value) {
        if (!isRecord(item)) {
          throw new Error(`${key} entries must be objects`);
        }
        const id = typeof item.id === "string" ? item.id : "";
        if (!id || !baseList.includes(id)) {
          throw new Error(`Adding provider entries is not permitted for group admins: ${key}`);
        }
        for (const field of Object.keys(item)) {
          if (field === "id") {
            continue;
          }
          if (!GROUP_ADMIN_PROVIDER_FIELDS.has(field)) {
            throw new Error(`Provider field not permitted for group admins: ${field}`);
          }
        }
      }
    }
  }
}
function mergeConfigPatch(base, patch) {
  const merged = { ...structuredClone(base) };
  for (const [key, value] of Object.entries(patch)) {
    if (!TOP_LEVEL_KEYS.has(key)) {
      throw new Error(`Unknown config key: ${key}`);
    }
    if (key === "settings") {
      if (!isRecord(value)) {
        throw new Error("settings must be an object");
      }
      for (const settingKey of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, settingKey)) {
          throw new Error(`Unknown setting: ${settingKey}`);
        }
      }
      merged.settings = { ...merged.settings, ...value };
    } else if (LIST_KEYS.includes(key)) {
      merged[key] = mergeById(merged[key] || [], value);
    } else {
      merged[key] = value;
    }
  }
  return normalizeConfig(merged);
}
function patchFromPath(path, value) {
  const parts = path.split(".").map((part) => part.trim()).filter(Boolean);
  if (parts.length === 0) {
    throw new Error("Empty key");
  }
  if (parts[0] === "chatProviders" || parts[0] === "imageProviders") {
    if (parts.length < 3) {
      throw new Error(`Provider key needs <list>.<id>.<field>: ${path}`);
    }
    const item = { id: parts[1] };
    let node2 = item;
    for (let i = 2; i < parts.length - 1; i++) {
      const next = {};
      node2[parts[i]] = next;
      node2 = next;
    }
    node2[parts[parts.length - 1]] = value;
    return { [parts[0]]: [item] };
  }
  const root = {};
  let node = root;
  for (let i = 0; i < parts.length - 1; i++) {
    const next = {};
    node[parts[i]] = next;
    node = next;
  }
  node[parts[parts.length - 1]] = value;
  return root;
}

// ../../lib/web/dist/index.js
var PAGE_HTML = '<!doctype html>\n<html lang="en">\n    <head>\n        <meta charset="UTF-8" />\n        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />\n        <meta name="color-scheme" content="light dark" />\n        <meta name="theme-color" content="#f2f2f7" media="(prefers-color-scheme: light)" />\n        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />\n        <title>ChatGPT-Telegram-Workers</title>\n        <!-- Telegram Mini App SDK:\u7BA1\u7406\u540E\u53F0\u5728 TMA \u5185\u6253\u5F00\u65F6\u7528\u5B83\u83B7\u53D6 initData \u81EA\u52A8\u767B\u5F55 -->\n        <script src="https://telegram.org/js/telegram-web-app.js"></script>\n      <script type="module" crossorigin>\nvar D="/rpc";async function A(e,t,s){const a=await(await fetch(D,{method:"POST",headers:{"Content-Type":"application/json",...s},body:JSON.stringify({method:e,params:t})})).json().catch(()=>({}));if(a.error)throw new Error(a.error.message||`RPC ${e} failed`);return a.result}function d(e){const t=document.createElement("template");return t.innerHTML=e.trim(),t.content.firstElementChild}function B(e){const t=document.createElement("template");return t.innerHTML=e.trim(),t.content}function l(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}var T;function f(e,t=!1){let s=document.querySelector(".toast");s||(s=document.createElement("div"),s.className="toast",s.setAttribute("role","status"),s.setAttribute("aria-live","polite"),document.body.appendChild(s)),s.classList.toggle("error",t),s.textContent=e,s.classList.remove("show"),s.offsetWidth,s.classList.add("show"),clearTimeout(T),T=setTimeout(()=>s?.classList.remove("show"),2200)}function $(e){return`${e}-${Math.random().toString(36).slice(2,8)}`}function E(e,t,s="Tap again to confirm",a=3e3){if(e.dataset.armed==="1"){e.dataset.armed="",e.classList.remove("armed"),t();return}const i=e.innerHTML;e.dataset.armed="1",e.classList.add("armed"),e.textContent=s;const n=()=>{e.dataset.armed==="1"&&(e.dataset.armed="",e.classList.remove("armed"),e.innerHTML=i,e.removeEventListener("focusout",n))};setTimeout(n,a),e.addEventListener("focusout",n)}var O={bot:\'<rect width="16" height="12" x="4" y="9" rx="3.5"/><path d="M12 9V5"/><path d="M9.5 5h5"/><path d="M2.5 13.5v3"/><path d="M21.5 13.5v3"/><path d="M8.8 13.8v1.6"/><path d="M15.2 13.8v1.6"/>\',image:\'<rect width="17" height="17" x="3.5" y="3.5" rx="3.5"/><circle cx="9" cy="9" r="1.8"/><path d="m20.5 14.5-3.3-3.3a2 2 0 0 0-2.8 0L6.5 19"/>\',gear:\'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>\',puzzle:\'<path d="M14 7V5.5A1.5 1.5 0 0 0 12.5 4h-1A1.5 1.5 0 0 0 10 5.5V7H7a2 2 0 0 0-2 2v2.6h1.4a1.6 1.6 0 0 1 0 3.2H5V19a2 2 0 0 0 2 2h2.6v-1.4a1.6 1.6 0 0 1 3.2 0V21H17a2 2 0 0 0 2-2v-3h1.4a1.6 1.6 0 0 0 0-3.2H19V9a2 2 0 0 0-2-2h-3z"/>\',terminal:\'<path d="m6 8 4 4-4 4"/><path d="M12.5 17H19"/>\',"chevron-left":\'<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>\',"chevron-right":\'<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>\',plus:\'<path d="M12 5v14"/><path d="M5 12h14"/>\',trash:\'<path d="M4 6.5h16"/><path d="M15.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5h-4A1.5 1.5 0 0 0 8.5 5v1.5"/><path d="M18.5 6.5v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-12"/>\',check:\'<path d="m4.5 12.5 5 5L19.5 7"/>\',x:\'<path d="M6 6l12 12"/><path d="M18 6 6 18"/>\',"minus-circle":\'<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>\',refresh:\'<path d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01"/><path d="M20.5 3.5v4h-4"/>\',external:\'<path d="M7.5 7.5h9v9"/><path d="M7.5 16.5 16.5 7.5"/>\',doc:\'<path d="M14 2.5H7A2 2 0 0 0 5 4.5v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5l-5-5z"/><path d="M14 2.5v5h5"/><path d="M9 12.5h6"/><path d="M9 16h6"/>\',warning:\'<path d="M12 3.5 2.8 19.2a1.6 1.6 0 0 0 1.4 2.4h15.6a1.6 1.6 0 0 0 1.4-2.4L12 3.5z"/><path d="M12 10v4"/><path d="M12 17.5h.01"/>\',"check-circle":\'<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9"/>\',"x-circle":\'<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/>\',globe:\'<circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/><path d="M3 12h18"/>\',star:\'<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3z"/>\',lock:\'<rect width="16" height="10.5" x="4" y="10.5" rx="3"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>\',logout:\'<path d="M9.5 20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.5"/><path d="m15.5 16.5 4.5-4.5-4.5-4.5"/><path d="M20 12H9.5"/>\',link:\'<path d="M10 13.5a5 5 0 0 0 7.5.5l2.5-2.5a5 5 0 0 0-7-7l-1.4 1.4"/><path d="M14 10.5a5 5 0 0 0-7.5-.5L4 12.5a5 5 0 0 0 7 7l1.4-1.4"/>\'};function o(e,t=!0){const s=O[e]??"";return`<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${t?\' aria-hidden="true" focusable="false"\':""}>${s}</svg>`}var U=class extends HTMLElement{connectedCallback(){this.render(),this.load()}render(){this.replaceChildren(d(`\n            <div class="contents">\n            <header class="navbar">\n                <div class="nav-brand"><span class="nav-appicon">${o("bot")}</span><strong>ChatGPT-Telegram-Workers</strong></div>\n                <span class="nav-badge" id="version">\u2026</span>\n            </header>\n            <main>\n                <section class="hero">\n                    <div class="app-icon">${o("bot")}</div>\n                    <div class="status-chip ok">${o("check-circle")}Deployed successfully</div>\n                    <p class="muted" id="meta"></p>\n                    <div id="token-alert" style="width:100%"></div>\n                </section>\n\n                <h2 class="section-h">Getting started</h2>\n                <section class="list-group">\n                    <a class="list-row" id="admin-link" href="/admin">\n                        <span class="row-icon" style="background:var(--blue)">${o("gear")}</span>\n                        <span class="row-main">\n                            <span class="row-title">Configure your bot</span>\n                            <span class="row-sub">Telegram token, AI providers and options</span>\n                        </span>\n                        ${o("chevron-right")}\n                    </a>\n                    <a class="list-row" id="init-link" href="/init">\n                        <span class="row-icon" style="background:var(--green)">${o("link")}</span>\n                        <span class="row-main">\n                            <span class="row-title">Bind the webhook</span>\n                            <span class="row-sub">Register with Telegram and publish commands</span>\n                        </span>\n                        ${o("chevron-right")}\n                    </a>\n                    <a class="list-row" href="/help">\n                        <span class="row-icon" style="background:var(--orange)">${o("doc")}</span>\n                        <span class="row-main">\n                            <span class="row-title">Help &amp; commands</span>\n                            <span class="row-sub">Quick start and bot command reference</span>\n                        </span>\n                        ${o("chevron-right")}\n                    </a>\n                </section>\n\n                <h2 class="section-h">Bot commands</h2>\n                <section class="list-group" id="commands"></section>\n\n                <h2 class="section-h">Tools</h2>\n                <section class="list-group">\n                    <a class="list-row" id="interpolate-link" href="/interpolate">\n                        <span class="row-icon" style="background:var(--purple)">${o("terminal")}</span>\n                        <span class="row-main">\n                            <span class="row-title">Template playground</span>\n                            <span class="row-sub">Preview how plugin templates render with your data</span>\n                        </span>\n                        ${o("chevron-right")}\n                    </a>\n                </section>\n\n                <h2 class="section-h">Resources</h2>\n                <section class="list-group">\n                    <a class="list-row" id="docs-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master/doc" target="_blank" rel="noopener">\n                        <span class="row-icon" style="background:var(--teal)">${o("doc")}</span>\n                        <span class="row-main"><span class="row-title">Documentation</span></span>\n                        ${o("external")}\n                    </a>\n                    <a class="list-row" id="repo-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers" target="_blank" rel="noopener">\n                        <span class="row-icon" style="background:var(--text-3)">${o("globe")}</span>\n                        <span class="row-main"><span class="row-title">Source code</span></span>\n                        ${o("external")}\n                    </a>\n                    <a class="list-row" id="issues-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/issues" target="_blank" rel="noopener">\n                        <span class="row-icon" style="background:var(--red)">${o("warning")}</span>\n                        <span class="row-main"><span class="row-title">Report an issue</span></span>\n                        ${o("external")}\n                    </a>\n                </section>\n\n                <footer class="page-footer" id="build"></footer>\n            </main>\n          </div>\n        `))}set(e,t){const s=this.querySelector(`#${e}`);s&&(s.textContent=t)}link(e,t){const s=this.querySelector(`#${e}`);s&&t&&(s.href=t)}async load(){try{const e=await A("pages.info");if(this.set("version",`v${e.version}`),this.set("meta",`${e.domain}`),this.set("build",`build ${e.timestamp}`),this.link("admin-link",e.adminUrl),this.link("init-link",e.initUrl),this.link("interpolate-link",e.interpolateUrl),this.link("docs-link",e.docsUrl),this.link("repo-link",e.repoUrl),this.link("issues-link",e.issuesUrl),!e.hasToken){const t=d(`<div class="alert warn">${o("warning")}<span>TELEGRAM_TOKEN is not set. Add it to your environment before binding the webhook.</span></div>`);this.querySelector("#token-alert")?.replaceChildren(t)}this.renderCommands(e.commands)}catch{this.set("meta","Failed to load page info."),this.renderCommands([])}}renderCommands(e){const t=this.querySelector("#commands");if(t){if(!e.length){t.replaceChildren(d(\'<div class="list-row"><span class="row-main"><span class="row-sub">No commands available yet. Bind the webhook to publish them.</span></span></div>\'));return}t.replaceChildren(...e.map(({command:s,description:a})=>d(`<div class="list-row">\n                        <span class="row-main">\n                            <span class="row-title" style="font-family:var(--mono);font-size:15px;color:var(--blue)">${l(s)}</span>\n                            ${a?`<span class="row-sub">${l(a)}</span>`:""}\n                        </span>\n                    </div>`)))}}};customElements.define("page-home",U);var H=[{title:"Configure the bot",sub:"Set TELEGRAM_TOKEN and your AI provider API keys in the environment, or manage them later in the admin panel.",color:"var(--blue)",icon:"gear"},{title:"Bind the webhook",sub:"Open the bind page to register this deployment with Telegram and publish the bot commands.",color:"var(--green)",icon:"link"},{title:"Start chatting",sub:"Find your bot in Telegram and send a message. Use /help in chat to list everything it can do.",color:"var(--orange)",icon:"bot"}],F=class extends HTMLElement{connectedCallback(){this.render(),this.load()}render(){this.replaceChildren(d(`\n            <div class="contents">\n            <header class="navbar">\n                <a class="nav-left" href="/">${o("chevron-left")}Home</a>\n                <span class="nav-title">Help</span>\n            </header>\n            <main>\n                <section class="hero" style="padding-bottom:8px">\n                    <div class="app-icon">${o("doc")}</div>\n                    <h1>Help</h1>\n                    <p class="muted">Everything you need to run and use your bot.</p>\n                </section>\n\n                <h2 class="section-h">Quick start</h2>\n                <section class="list-group">\n                    ${H.map((e,t)=>`\n                        <div class="list-row">\n                            <span class="row-num">${t+1}</span>\n                            <span class="row-main">\n                                <span class="row-title">${e.title}</span>\n                                <span class="row-sub">${e.sub}</span>\n                            </span>\n                        </div>`).join("")}\n                </section>\n\n                <h2 class="section-h">Bot commands</h2>\n                <section class="list-group" id="commands"></section>\n\n                <h2 class="section-h">Resources</h2>\n                <section class="list-group">\n                    <a class="list-row" id="admin-link" href="/admin">\n                        <span class="row-icon" style="background:var(--blue)">${o("gear")}</span>\n                        <span class="row-main"><span class="row-title">Admin panel</span><span class="row-sub">Providers, settings, plugins</span></span>\n                        ${o("chevron-right")}\n                    </a>\n                    <a class="list-row" id="interpolate-link" href="/interpolate">\n                        <span class="row-icon" style="background:var(--purple)">${o("terminal")}</span>\n                        <span class="row-main"><span class="row-title">Template playground</span><span class="row-sub">Test plugin templates</span></span>\n                        ${o("chevron-right")}\n                    </a>\n                    <a class="list-row" id="docs-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master/doc" target="_blank" rel="noopener">\n                        <span class="row-icon" style="background:var(--teal)">${o("doc")}</span>\n                        <span class="row-main"><span class="row-title">Documentation</span></span>\n                        ${o("external")}\n                    </a>\n                    <a class="list-row" id="issues-link" href="https://github.com/TBXark/ChatGPT-Telegram-Workers/issues" target="_blank" rel="noopener">\n                        <span class="row-icon" style="background:var(--red)">${o("warning")}</span>\n                        <span class="row-main"><span class="row-title">Report an issue</span></span>\n                        ${o("external")}\n                    </a>\n                </section>\n\n                <footer class="page-footer">ChatGPT-Telegram-Workers</footer>\n            </main>\n          </div>\n        `))}async load(){let e;try{e=await A("pages.info")}catch{this.renderCommands([]);return}this.link("admin-link",e.adminUrl),this.link("interpolate-link",e.interpolateUrl),this.link("docs-link",e.docsUrl),this.link("issues-link",e.issuesUrl),this.link("repo-link",e.repoUrl),this.renderCommands(e.commands??[])}renderCommands(e){const t=this.querySelector("#commands");if(t){if(!e.length){t.replaceChildren(d(\'<div class="list-row"><span class="row-main"><span class="row-sub">No commands available yet.</span></span></div>\'));return}t.replaceChildren(...e.map(({command:s,description:a})=>d(`<div class="list-row">\n                        <span class="row-main">\n                            <span class="row-title" style="font-family:var(--mono);font-size:15px;color:var(--blue)">${l(s)}</span>\n                            ${a?`<span class="row-sub">${l(a)}</span>`:""}\n                        </span>\n                    </div>`)))}}link(e,t){const s=this.querySelector(`#${e}`);s&&t&&(s.href=t)}};customElements.define("page-help",F);var S="ctw-admin-token";function _(){return localStorage.getItem(S)}function L(e){e?localStorage.setItem(S,e):localStorage.removeItem(S)}function m(e,t){const s=_();return A(e,t,s?{Authorization:`Bearer ${s}`}:void 0)}var g={authInfo:()=>m("admin.authInfo"),loginInitData:e=>m("admin.login",{initData:e}),loginPassword:e=>m("admin.login",{password:e}),meta:()=>m("admin.meta"),getConfig:()=>m("admin.config.get"),saveConfig:e=>m("admin.config.save",e),agents:()=>m("admin.agents"),models:(e,t)=>m("admin.models",{kind:e,provider:t}),bind:()=>m("init.bind"),pageInfo:()=>m("pages.info")},G=class extends HTMLElement{connectedCallback(){this.render(),this.querySelector("#retry")?.addEventListener("click",()=>this.run()),this.run()}render(){this.replaceChildren(d(`\n            <div class="contents">\n            <header class="navbar">\n                <a class="nav-left" href="/">${o("chevron-left")}Home</a>\n                <span class="nav-title">Bind Webhook</span>\n            </header>\n            <main>\n                <section class="hero">\n                    <div class="big-status" id="status-icon"><div class="spinner"></div></div>\n                    <h1 id="status-title">Binding webhook\u2026</h1>\n                    <p class="muted" id="domain"></p>\n                </section>\n\n                <h2 class="section-h">Telegram response</h2>\n                <div class="code-block" id="result" role="status"><pre>Contacting Telegram...</pre></div>\n\n                <div class="btn-row">\n                    <button type="button" class="btn" id="retry">${o("refresh")}<span>Retry</span></button>\n                </div>\n            </main>\n          </div>\n        `))}showStatus(e){const t=this.querySelector("#status-icon"),s=this.querySelector("#status-title");if(!t||!s)return;if(e==="no-token"){t.className="big-status err",t.replaceChildren(d(`${o("warning")}`)),s.textContent="TELEGRAM_TOKEN is not set";return}const a=e==="ok";t.className=a?"big-status ok":"big-status err",t.replaceChildren(d(o(a?"check-circle":"x-circle"))),s.textContent=a?"Webhook bound successfully":"Binding finished with errors"}setResult(e){this.querySelector("#result")?.replaceChildren(d("<pre></pre>"));const t=this.querySelector("#result pre");t&&(t.textContent=e)}async run(){const e=this.querySelector("#retry"),t=this.querySelector("#status-icon"),s=this.querySelector("#status-title");if(!(!e||!t||!s)){e.disabled=!0,t.className="big-status",t.replaceChildren(d(\'<div class="spinner"></div>\')),s.textContent="Binding webhook\u2026",this.setResult("Contacting Telegram...");try{const a=await g.bind(),i=this.querySelector("#domain");i&&(i.textContent=a.domain??location.host),this.showStatus(a.tokenMissing?"no-token":a.outcome),this.setResult(JSON.stringify(a.result??a,null,2))}catch(a){this.showStatus("error");const i=a.message||"Failed to reach the server.";this.setResult(i.toLowerCase().includes("unauthorized")?"Unauthorized. Open /admin, log in, then retry.":"Failed to reach the server.")}finally{e.disabled=!1}}}};customElements.define("page-init",G);var K=/\\{\\{#each(?::(\\w+))?\\s+(\\w+)\\s+in\\s+([\\w.[\\]]+)\\}\\}([\\s\\S]*?)\\{\\{\\/each(?::\\1)?\\}\\}/g,z=/\\{\\{#if(?::(\\w+))?\\s+([\\w.[\\]]+)\\}\\}([\\s\\S]*?)(?:\\{\\{#else(?::\\1)?\\}\\}([\\s\\S]*?))?\\{\\{\\/if(?::\\1)?\\}\\}/g,j=/\\{\\{([\\w.[\\]]+)\\}\\}/g;function k(e,t){if(e===".")return t["."]??t;try{return e.split(".").reduce((s,a)=>{if(a.includes("[")&&a.includes("]")){const[i,n]=a.split("["),r=n.slice(0,-1);let c=Number.parseInt(r,10);return Number.isNaN(c)&&(c=k(r,t)),s?.[i]?.[c]}return s?.[a]},t)}catch(s){console.error(`Error evaluating expression: ${e}`,s);return}}function P(e,t,s){const a=(r,c,v,u)=>k(r,u)?c:v||"",i=(r,c,v,u)=>{const h=k(c,u);return Array.isArray(h)?h.map(b=>P(v,{...u,[r]:b,".":b})).join(""):(console.warn(`Expression "${c}" did not evaluate to an array`),"")};return((r,c)=>(r=r.replace(K,(v,u,h,b,y)=>i(h,b,y,c)),r=r.replace(z,(v,u,h,b,y)=>a(h,b,y,c)),r.replace(j,(v,u)=>{const h=k(u,c);return h===void 0?`{{${u}}}`:s?s(h):String(h)})))(e,t)}var V=`\n<b>DNS query: {{Question[0].name}}</b>\n<code>Status: {{#if TC}}TC,{{/if}}{{#if RD}}RD,{{/if}}{{#if RA}}RA,{{/if}}{{#if AD}}AD,{{/if}}{{#if CD}}CD,{{/if}}{{Status}}</code>\n\n<b>Answer</b>{{#each answer in Answer}}\n<code>{{answer.name}}, {{answer.type}}, (TTL: {{answer.TTL}}),{{answer.data}}</code>{{/each}}\n`,W=JSON.stringify({Status:0,TC:!1,RD:!0,RA:!0,AD:!1,CD:!1,Question:[{name:"google.com",type:1}],Answer:[{name:"google.com",type:1,TTL:300,data:"172.217.24.110"}]},null,2),J=class extends HTMLElement{connectedCallback(){this.replaceChildren(d(`\n            <div class="contents">\n            <header class="navbar">\n                <a class="nav-left" href="/">${o("chevron-left")}Home</a>\n                <span class="nav-title">Template Playground</span>\n            </header>\n            <main class="pg-grid">\n                <section class="pane" id="template-area">\n                    <div class="pane-head"><span>${o("doc")}Template</span></div>\n                    <textarea id="template" placeholder="Enter your template, using {{variable name}} to represent variables." spellcheck="false" aria-label="Template"></textarea>\n                </section>\n                <section class="pane" id="data-area">\n                    <div class="pane-head"><span>${o("terminal")}Data \xB7 JSON</span></div>\n                    <textarea id="data" placeholder="Enter data in JSON format." spellcheck="false" aria-label="Data JSON"></textarea>\n                </section>\n                <section class="pane preview-area">\n                    <div class="pane-head"><span>${o("image")}Preview</span></div>\n                    <pre id="preview" role="region" aria-label="Rendered preview"></pre>\n                </section>\n            </main>\n          </div>\n        `));const e=this.querySelector("#template"),t=this.querySelector("#data"),s=()=>this.updatePreview(e.value,t.value);e.addEventListener("input",s),t.addEventListener("input",s),e.value=V,t.value=W,s()}updatePreview(e,t){const s=this.querySelector("#preview");if(s)try{s.innerHTML=P(e,JSON.parse(t))}catch(a){s.replaceChildren(d(`<span class="error">${a.message}</span>`))}}};customElements.define("page-interpolate",J);function X(){const e=window.Telegram?.WebApp?.initData;if(e)return e;const t=window.location.hash.replace(/^#/,"");return t?new URLSearchParams(t).get("tgWebAppData")??"":""}function Q(){try{window.Telegram?.WebApp?.ready?.(),window.Telegram?.WebApp?.expand?.()}catch{}}var Y=class extends HTMLElement{connectedCallback(){this.replaceChildren(d(`\n            <div class="contents">\n            <header class="navbar">\n                <div class="nav-brand"><span class="nav-appicon">${o("bot")}</span><strong>Admin</strong></div>\n            </header>\n            <main>\n                <section class="hero">\n                    <div class="app-icon" style="background:var(--blue)"><div class="spinner"></div></div>\n                    <h1>Checking\u2026</h1>\n                    <p class="muted">Verifying authorization.</p>\n                </section>\n            </main>\n            </div>`)),this.attempt()}async attempt(){Q();const e=X();if(e)try{const{token:s}=await g.loginInitData(e);L(s),this.dispatchEvent(new CustomEvent("logged-in",{bubbles:!0}));return}catch(s){f(`TMA login failed: ${s.message}`,!0)}let t={passwordEnabled:!1,hasToken:!1};try{t=await g.authInfo()??t}catch{}this.renderPassword(t.passwordEnabled)}renderPassword(e){if(!e){this.replaceChildren(d(`\n                <div class="contents">\n                <header class="navbar">\n                    <div class="nav-brand"><span class="nav-appicon">${o("bot")}</span><strong>Admin</strong></div>\n                </header>\n                <main>\n                    <section class="hero">\n                        <div class="app-icon" style="background:var(--red)">${o("lock")}</div>\n                        <h1>Cannot sign in</h1>\n                        <p class="muted">Opened outside the Telegram Mini App and ADMIN_PASSWORD is not set.</p>\n                    </section>\n                </main>\n            </div>`));return}this.replaceChildren(d(`\n            <div class="contents">\n            <header class="navbar">\n                <div class="nav-brand"><span class="nav-appicon">${o("bot")}</span><strong>Admin</strong></div>\n            </header>\n            <main>\n                <section class="hero">\n                    <div class="app-icon">${o("lock")}</div>\n                    <h1>Admin</h1>\n                    <p class="muted">Enter the administrator password to continue.</p>\n                </section>\n                <section class="list-group">\n                    <div class="list-row">\n                        <input class="bare" style="text-align:left" type="password" id="pwd" placeholder="Password"\n                            autocomplete="current-password" aria-label="Password" />\n                    </div>\n                </section>\n                <div class="btn-row"><button type="button" class="btn" id="login">Log In</button></div>\n            </main>\n            </div>`));const t=async()=>{const s=this.querySelector("#pwd").value,a=this.querySelector("#login");if(!a.disabled){a.disabled=!0,a.textContent="Logging In\u2026";try{const{token:i}=await g.loginPassword(s);L(i),this.dispatchEvent(new CustomEvent("logged-in",{bubbles:!0}))}catch(i){f(i.message,!0),a.disabled=!1,a.textContent="Log In"}}};this.querySelector("#login")?.addEventListener("click",t),this.querySelector("#pwd")?.addEventListener("keydown",s=>{s.key==="Enter"&&t()})}};customElements.define("admin-login",Y);var Z=class extends HTMLElement{pushed_=!1;pageEl=null;meta=null;get pushed(){return this.pushed_}connectedCallback(){this.addEventListener("close",()=>{this.pushed_&&history.back()}),window.addEventListener("popstate",this.onPopState)}disconnectedCallback(){window.removeEventListener("popstate",this.onPopState)}onPopState=()=>{this.pushed_&&this.pop()};push(e){if(this.pushed_)return;const t=d(`\n            <div class="push-page" role="dialog" aria-label="${e.title}">\n                <header class="navbar">\n                    <button type="button" class="nav-left" data-back>${o("chevron-left")}${e.back}</button>\n                    <span class="nav-title">${e.title}</span>\n                </header>\n                <div class="push-content"></div>\n            </div>\n        `);this.pushed_=!0,this.pageEl=t,this.meta=e,this.classList.add("pushed"),this.appendChild(t),t.querySelector("[data-back]")?.addEventListener("click",()=>history.back()),e.mount(t.querySelector(".push-content")),requestAnimationFrame(()=>requestAnimationFrame(()=>t.classList.add("open"))),history.pushState({ctwPush:!0},"")}pop(){if(!this.pushed_||!this.pageEl)return;this.pushed_=!1;const e=this.pageEl;this.pageEl=null;const t=this.meta;this.meta=null,this.classList.remove("pushed"),e.classList.remove("open"),e.classList.add("leaving"),setTimeout(()=>{e.remove(),t?.onClose?.(),this.dispatchEvent(new CustomEvent("pop",{detail:t}))},380)}popInstant(){if(!this.pushed_)return;this.pushed_=!1,this.pageEl?.remove(),this.pageEl=null;const e=this.meta;this.meta=null,this.classList.remove("pushed"),e?.onClose?.(),history.replaceState(null,"")}};customElements.define("nav-stack",Z);var C=[{id:"general",label:"General",icon:"gear",tint:"var(--blue)",footer:"Public Base URL is the HTTPS domain used for the webhook and admin links."},{id:"chat",label:"Chat & Streaming",icon:"bot",tint:"var(--green)"},{id:"telegram",label:"Telegram",icon:"globe",tint:"var(--teal)"},{id:"access",label:"Access Control",icon:"lock",tint:"var(--orange)"},{id:"history",label:"History",icon:"refresh",tint:"var(--purple)"}],M=[{key:"publicBaseUrl",label:"Public Base URL",type:"text",group:"general"},{key:"systemInitMessage",label:"System Prompt",type:"textarea",group:"general"},{key:"language",label:"Language",type:"select",options:["zh-cn","zh-hant","en","pt"],group:"general"},{key:"updateBranch",label:"Update Branch",type:"text",group:"general"},{key:"streamMode",label:"Stream Mode",type:"boolean",group:"chat"},{key:"safeMode",label:"Safe Mode",type:"boolean",group:"chat"},{key:"debugMode",label:"Debug Mode",type:"boolean",group:"chat"},{key:"devMode",label:"Dev Mode",type:"boolean",group:"chat"},{key:"chatCompleteApiTimeout",label:"API Timeout (s)",type:"number",group:"chat"},{key:"maxOutputTokens",label:"Max Output Tokens",type:"number",group:"chat"},{key:"telegramMinStreamInterval",label:"Stream Interval (ms)",type:"number",group:"chat"},{key:"defaultParseMode",label:"Parse Mode",type:"select",options:["Markdown","MarkdownV2","HTML"],group:"chat"},{key:"extraMessageContext",label:"Extra Message Context",type:"boolean",group:"chat"},{key:"showReplyButton",label:"Show Reply Button",type:"boolean",group:"chat"},{key:"modelListColumns",label:"Model List Columns",type:"number",group:"chat"},{key:"hideCommandButtons",label:"Hide Command Buttons",type:"list",group:"chat",addLabel:"Add Command",placeholder:"/command",footer:"Commands removed from the bot command menu. Add one per entry."},{key:"telegramApiDomain",label:"Telegram API Domain",type:"text",group:"telegram"},{key:"telegramPhotoSizeOffset",label:"Photo Size Offset",type:"number",group:"telegram"},{key:"telegramImageTransferMode",label:"Image Transfer",type:"select",options:["base64","url"],group:"telegram"},{key:"allowAllUsers",label:"Allow All Users",type:"boolean",group:"access"},{key:"groupChatBotEnable",label:"Group Bot Enable",type:"boolean",group:"access"},{key:"groupChatBotShareMode",label:"Group Share Mode",type:"boolean",group:"access"},{key:"allowedUserIds",label:"Allowed User IDs",type:"list",group:"access",addLabel:"Add User ID",placeholder:"123456789",footer:"Users allowed to chat with the bot. The admin ID is always allowed."},{key:"allowedGroupIds",label:"Allowed Group IDs",type:"list",group:"access",addLabel:"Add Group ID",placeholder:"-1001234567890",footer:"Groups where the bot may respond. Negative IDs keep the leading minus sign."},{key:"autoTrimHistory",label:"Auto Trim History",type:"boolean",group:"history"},{key:"maxHistoryLength",label:"Max History Length",type:"number",group:"history"},{key:"maxTokenLength",label:"Max Token Length",type:"number",group:"history"},{key:"historyImagePlaceholder",label:"History Image Placeholder",type:"text",group:"history"}];function ee(e){const t={...e};for(const s of Object.keys(t))Array.isArray(t[s])&&(t[s]=[...t[s]]);return t}var te=class extends HTMLElement{groupId="general";settings={};addingField=null;draft="";open(e,t){this.groupId=e,this.settings=t,this.addingField=null,this.draft="",this.render()}arrayOf(e){const t=this.settings[e];return Array.isArray(t)?t:[]}renderField(e){const t=this.settings[e.key],s=`data-key="${l(e.key)}"`,a=l(e.label);if(e.type==="boolean")return`<label class="list-row">\n                <span class="row-main"><span class="row-title">${a}</span></span>\n                <input type="checkbox" class="switch" ${s} ${t?"checked":""} aria-label="${a}" />\n            </label>`;if(e.type==="textarea")return`<div class="row-stack">\n                <span class="row-label">${a}</span>\n                <textarea class="bare" ${s} aria-label="${a}">${l(t??"")}</textarea>\n            </div>`;let i;return e.type==="number"?i=`<input class="bare" type="number" inputmode="decimal" ${s} value="${l(t??0)}" aria-label="${a}" />`:e.type==="select"?i=`<select class="bare" ${s} aria-label="${a}">${(e.options||[]).map(n=>`<option value="${l(n)}" ${n===t?"selected":""}>${l(n)}</option>`).join("")}</select>`:i=`<input class="bare" type="text" ${s} value="${l(t??"")}" placeholder="${l(e.placeholder||"")}" aria-label="${a}" />`,`<div class="row-field">\n            <span class="row-label">${a}</span>\n            ${i}\n        </div>`}renderListField(e){const t=String(e.key),s=this.arrayOf(t),a=s.map(c=>`\n                <div class="list-row">\n                    <button type="button" class="row-btn" data-list-remove="${t}" data-value="${l(c)}" aria-label="Remove ${l(c)}">${o("minus-circle")}</button>\n                    <span class="row-main"><span class="row-title mono">${l(c)}</span></span>\n                </div>`).join(""),i=s.length?"":\'<div class="list-row"><span class="row-main"><span class="row-sub">No entries yet.</span></span></div>\',n=this.addingField===t?`<div class="list-row">\n                       <input class="bare left mono" data-list-input="${t}" value="${l(this.draft)}" placeholder="${l(e.placeholder||"")}" aria-label="${l(e.addLabel||"Add")}" />\n                       <button type="button" class="row-btn blue" data-list-cancel="${t}" aria-label="Cancel">Cancel</button>\n                       <button type="button" class="row-btn blue" data-list-confirm="${t}" aria-label="Add">Add</button>\n                   </div>`:`<button type="button" class="list-row" data-list-add="${t}">\n                       <span class="row-icon" style="background:var(--green)">${o("plus")}</span>\n                       <span class="row-main"><span class="row-title">${l(e.addLabel||"Add")}</span></span>\n                   </button>`,r=e.footer?`<p class="group-footer">${l(e.footer)}</p>`:"";return`<h2 class="section-h">${l(e.label)}</h2><section class="list-group">${i}${a}${n}</section>${r}`}render(){const e=M.filter(n=>n.group===this.groupId),t=[];let s=[];const a=()=>{s.length&&(t.push(`<section class="list-group">${s.join("")}</section>`),s=[])};for(const n of e)n.type==="list"?(a(),t.push(this.renderListField(n))):s.push(this.renderField(n));a();const i=C.find(n=>n.id===this.groupId)?.footer;i&&t.push(`<p class="group-footer">${l(i)}</p>`),this.replaceChildren(d(`<main>${t.join("")}</main>`)),this.bind()}confirmEntry(e){const t=this.draft.trim();if(t){const s=this.arrayOf(e);s.includes(t)||(this.settings[e]=[...s,t])}this.addingField=null,this.draft="",this.render()}bind(){const e=this.settings;this.querySelectorAll("[data-key]").forEach(t=>{const s=t.dataset.key,a=M.find(n=>String(n.key)===s)?.type||"text",i=()=>{if(a==="boolean")e[s]=t.checked;else if(a==="number"){const n=Number(t.value);e[s]=Number.isFinite(n)?n:0}else e[s]=t.value};t.addEventListener("input",i),t.addEventListener("change",i)}),this.querySelectorAll("[data-list-remove]").forEach(t=>{t.addEventListener("click",()=>{const s=t.dataset.listRemove,a=t.dataset.value;e[s]=this.arrayOf(s).filter(i=>i!==a),this.render()})}),this.querySelectorAll("[data-list-add]").forEach(t=>{t.addEventListener("click",()=>{this.addingField=t.dataset.listAdd,this.draft="",this.render(),this.querySelector("[data-list-input]")?.focus()})}),this.querySelectorAll("[data-list-cancel]").forEach(t=>{t.addEventListener("click",()=>{this.addingField=null,this.draft="",this.render()})}),this.querySelectorAll("[data-list-confirm]").forEach(t=>{t.addEventListener("click",()=>this.confirmEntry(t.dataset.listConfirm))}),this.querySelectorAll("[data-list-input]").forEach(t=>{t.addEventListener("input",()=>{this.draft=t.value}),t.addEventListener("keydown",s=>{s.key==="Enter"&&(s.preventDefault(),this.confirmEntry(t.dataset.listInput))})})}};customElements.define("settings-detail",te);var se=class extends HTMLElement{settings={};aboutInfo=null;set value(e){this.settings=ee(e),this.render()}set about(e){this.aboutInfo=e,this.settings&&this.render()}get value(){return this.settings}summary(e){const t=this.settings;switch(e){case"general":return t.publicBaseUrl?String(t.publicBaseUrl):"Not configured";case"chat":return`${t.streamMode?"Streaming":"No streaming"} \xB7 ${t.defaultParseMode||"Markdown"}`;case"telegram":return String(t.telegramApiDomain||"api.telegram.org");case"access":{if(t.allowAllUsers)return"All users allowed";const s=this.arrayLength("allowedUserIds"),a=this.arrayLength("allowedGroupIds");return`${s} user${s===1?"":"s"}, ${a} group${a===1?"":"s"}`}case"history":return`Max ${String(t.maxHistoryLength??0)} messages`}}arrayLength(e){const t=this.settings[e];return Array.isArray(t)?t.length:0}openGroup(e){this.dispatchEvent(new CustomEvent("push",{bubbles:!0,composed:!0,detail:{title:e.label,back:"Settings",onClose:()=>this.render(),autosave:!0,mount:t=>{const s=document.createElement("settings-detail");s.open(e.id,this.settings),t.replaceChildren(s)}}}))}render(){const e=C.map(i=>`\n            <button type="button" class="list-row" data-goto="${i.id}">\n                <span class="row-icon" style="background:${i.tint}">${o(i.icon)}</span>\n                <span class="row-main">\n                    <span class="row-title">${l(i.label)}</span>\n                    <span class="row-sub">${l(this.summary(i.id))}</span>\n                </span>\n                ${o("chevron-right")}\n            </button>`).join(""),t=this.aboutInfo,s=i=>i?`${i.label||i.name} \xB7 ${i.model}`:"Not configured",a=t?`<h2 class="section-h">About</h2>\n               <section class="list-group">\n                   <div class="list-row">\n                       <span class="row-main"><span class="row-title">Version</span></span>\n                       <span class="row-value mono">${l(t.version||"unknown")}</span>\n                   </div>\n                   <div class="list-row">\n                       <span class="row-main"><span class="row-title">Chat Model</span></span>\n                       <span class="row-value">${l(s(t.chat))}</span>\n                   </div>\n                   <div class="list-row">\n                       <span class="row-main"><span class="row-title">Image Model</span></span>\n                       <span class="row-value">${l(s(t.image))}</span>\n                   </div>\n               </section>`:"";this.replaceChildren(B(`<main><section class="list-group">${e}</section>${a}</main>`)),this.querySelectorAll("[data-goto]").forEach(i=>{i.addEventListener("click",()=>{const n=C.find(r=>r.id===i.dataset.goto);n&&this.openGroup(n)})})}};customElements.define("settings-form",se);var ae=class extends HTMLElement{kind="chat";protocols=[];provider;opts;addingModel=!1;fetched=null;fetching=!1;open(e,t,s,a){this.kind=e,this.protocols=t,this.provider=s,this.opts=a,this.addingModel=!1,this.fetched=null,this.fetching=!1,this.render()}close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}addModels(e){for(const t of e){const s=t.trim();s&&!this.provider.models.includes(s)&&this.provider.models.push(s)}this.provider.model=this.provider.model||this.provider.models[0]||"",this.provider.label||(this.provider.label=this.protocols.find(t=>t.id===this.provider.protocol)?.label||""),this.addingModel=!1,this.render()}async fetchModels(){if(!this.fetching){this.fetching=!0,this.render();try{const e=await g.models(this.kind,this.provider);if(e.error)throw new Error(e.error);this.fetched=e.models}catch(e){f(e.message,!0)}finally{this.fetching=!1,this.render()}}}render(){const e=this.provider,t=this.protocols.find(p=>p.id===e.protocol),s=this.protocols.map(p=>`<option value="${l(p.id)}" ${p.id===e.protocol?"selected":""}>${l(p.label)}</option>`).join(""),a=(t?.optionFields||[]).map(p=>`\n                <div class="row-field">\n                    <span class="row-label">${l(p.label)}${p.required?\' <span style="color:var(--red)">*</span>\':""}</span>\n                    <input class="bare" ${p.type==="password"?\'type="password" autocomplete="off"\':""} data-opt="${l(p.key)}" value="${l(e.options?.[p.key]??"")}" placeholder="${l(p.placeholder||"")}" aria-label="${l(p.label)}" />\n                </div>`).join(""),i=t?.usesBaseUrl!==!1,n=t?.usesApiKey!==!1,r=i?`<div class="row-field">\n                   <span class="row-label">Base URL</span>\n                   <input class="bare" type="url" inputmode="url" data-field="baseUrl" value="${l(e.baseUrl)}" placeholder="https://api.example.com/v1" aria-label="Base URL" />\n               </div>`:"",c=n?`<div class="row-field">\n                   <span class="row-label">API Key</span>\n                   <input class="bare" type="password" data-field="apiKey" value="${l(e.apiKey)}"\n                       placeholder="${e.hasApiKey&&!e.clearApiKey?"Unchanged":"Required"}" autocomplete="off" aria-label="API key" />\n               </div>`:"",v=n?e.clearApiKey?`<button type="button" class="list-row" data-undo-clear-key>\n                     <span class="row-main"><span class="row-title">Key Will Be Removed</span><span class="row-sub">Tap to undo</span></span>\n                 </button>`:e.hasApiKey&&!e.apiKey?\'<button type="button" class="list-row destructive" data-clear-key>Clear API Key</button>\':"":"",u=e.protocol==="workers"?this.opts.workersBinding?\'<p class="group-footer">AI binding detected. Account ID and API Token are optional and only used when the binding is unavailable.</p>\':\'<p class="group-footer">No AI binding on this deployment. Fill in Account ID and API Token, or add the AI binding.</p>\':"",h=e.models.map(p=>`\n                <div class="list-row">\n                    <button type="button" class="row-btn" data-remove-model="${l(p)}" aria-label="Remove model ${l(p)}">${o("minus-circle")}</button>\n                    <button type="button" class="row-main row-main-btn" data-pick-model="${l(p)}">\n                        <span class="row-title" style="font-family:var(--mono);font-size:15px">${l(p)}</span>\n                    </button>\n                    ${e.model===p?`<span class="row-check">${o("check")}</span>`:""}\n                </div>`).join(""),b=e.models.length?"":\'<div class="list-row"><span class="row-main"><span class="row-sub">No models. Add one to use this provider.</span></span></div>\',y=this.addingModel?`<div class="list-row">\n                  <input class="bare left mono" data-model-input placeholder="model name" aria-label="Model name" />\n                  <button type="button" class="row-btn blue" data-cancel-model aria-label="Cancel">Cancel</button>\n                  <button type="button" class="row-btn blue" data-confirm-model aria-label="Add model">Add</button>\n              </div>`:`<button type="button" class="list-row" data-add-model>\n                  <span class="row-icon" style="background:var(--green)">${o("plus")}</span>\n                  <span class="row-main"><span class="row-title">Add Model</span></span>\n              </button>`,q=t?.modelList==="none"?"":`<button type="button" class="list-row" data-fetch-models>\n                      <span class="row-icon" style="background:var(--teal)">${o("refresh")}</span>\n                      <span class="row-main"><span class="row-title">Fetch Models</span><span class="row-sub">Load the model list from the API</span></span>\n                      <span class="row-value">${this.fetching?\'<div class="spinner"></div>\':this.fetched?`${this.fetched.length} found`:""}</span>\n                  </button>`,R=this.fetched&&this.fetched.length?`<h2 class="section-h">Fetched models</h2>\n                   <section class="list-group">\n                       ${this.fetched.map(p=>`\n                               <button type="button" class="list-row" data-add-fetched="${l(p)}">\n                                   <span class="row-main"><span class="row-title" style="font-family:var(--mono);font-size:15px">${l(p)}</span></span>\n                                   ${e.models.includes(p)?`<span class="row-check">${o("check")}</span>`:o("plus")}\n                               </button>`).join("")}\n                       <button type="button" class="list-row" data-add-all-fetched>\n                           <span class="row-main"><span class="row-title">Add All</span></span>\n                       </button>\n                   </section>`:"",N=this.opts.isDraft?"":`<h2 class="section-h"></h2>\n               <section class="list-group">\n                   <button type="button" class="list-row destructive" data-remove>Delete Provider</button>\n               </section>`;this.replaceChildren(d(`\n            <main>\n                <h2 class="section-h">Provider</h2>\n                <section class="list-group">\n                    <div class="row-field">\n                        <span class="row-label">Name</span>\n                        <input class="bare" data-field="label" value="${l(e.label)}" placeholder="${l(t?.label||e.protocol)}" aria-label="Name" />\n                    </div>\n                    <div class="row-field">\n                        <span class="row-label">API Format</span>\n                        <select class="bare" data-apply-protocol aria-label="API format">${s}</select>\n                    </div>\n                    ${r}\n                    ${c}\n                    ${v}\n                    ${a}\n                </section>\n                ${u}\n                <p class="group-footer">API format switch resets the base URL and protocol options.</p>\n\n                <h2 class="section-h">Models</h2>\n                <section class="list-group">${b}${h}${y}${q}</section>\n                <p class="group-footer">Tap a model to make it the default. The checkmark marks the current default.</p>\n                ${R}\n\n                <h2 class="section-h">Options</h2>\n                <section class="list-group">\n                    <label class="list-row">\n                        <span class="row-main"><span class="row-title">Enabled</span></span>\n                        <input type="checkbox" class="switch" data-toggle-enabled ${e.enabled?"checked":""} />\n                    </label>\n                    <button type="button" class="list-row" data-toggle-default>\n                        <span class="row-icon" style="background:var(--orange)">${o("star")}</span>\n                        <span class="row-main"><span class="row-title">Set as Default</span><span class="row-sub">Use for every request by default</span></span>\n                        ${this.opts.isDefault?`<span class="row-check">${o("check")}</span>`:""}\n                    </button>\n                </section>\n\n                <h2 class="section-h">Extra Params</h2>\n                <section class="list-group">\n                    <div class="row-stack">\n                        <span class="row-label">${this.kind==="image"?"JSON, merged into image generation requests":"JSON, merged into chat completion requests"}</span>\n                        <textarea class="bare code" data-field="extraParams" placeholder=\'{"key":"value"}\' spellcheck="false">${l(JSON.stringify(e.extraParams||{},null,2))}</textarea>\n                    </div>\n                </section>\n                ${N}\n            </main>\n        `)),this.bind()}bind(){const e=this.provider,t=()=>this.render();this.querySelectorAll("[data-field]").forEach(n=>{const r=n.dataset.field,c=()=>{if(r==="extraParams"){try{e.extraParams=JSON.parse(n.value||"{}")}catch{}return}r==="apiKey"&&(e.clearApiKey=!1),e[r]=n.value};n.addEventListener("input",c),n.addEventListener("change",c)}),this.querySelectorAll("[data-opt]").forEach(n=>{const r=n.dataset.opt,c=()=>{e.options={...e.options,[r]:n.value}};n.addEventListener("input",c),n.addEventListener("change",c)}),this.querySelector("[data-apply-protocol]")?.addEventListener("change",n=>{const r=this.protocols.find(c=>c.id===n.target.value);e.protocol=n.target.value,e.baseUrl=r?.defaultBaseUrl||"",e.options={},t()}),this.querySelectorAll("[data-pick-model]").forEach(n=>{n.addEventListener("click",()=>{e.model=n.dataset.pickModel,t()})}),this.querySelectorAll("[data-remove-model]").forEach(n=>{n.addEventListener("click",()=>{const r=n.dataset.removeModel;e.models=e.models.filter(c=>c!==r),e.model===r&&(e.model=e.models[0]||""),t()})}),this.querySelector("[data-add-model]")?.addEventListener("click",()=>{this.addingModel=!0,t(),this.querySelector("[data-model-input]")?.focus()}),this.querySelector("[data-cancel-model]")?.addEventListener("click",()=>{this.addingModel=!1,t()});const s=()=>{const n=this.querySelector("[data-model-input]")?.value.trim();n?this.addModels([n]):(this.addingModel=!1,t())};this.querySelector("[data-confirm-model]")?.addEventListener("click",s),this.querySelector("[data-model-input]")?.addEventListener("keydown",n=>{n.key==="Enter"&&(n.preventDefault(),s())}),this.querySelector("[data-fetch-models]")?.addEventListener("click",()=>this.fetchModels()),this.querySelectorAll("[data-add-fetched]").forEach(n=>{n.addEventListener("click",()=>this.addModels([n.dataset.addFetched]))}),this.querySelector("[data-add-all-fetched]")?.addEventListener("click",()=>this.addModels(this.fetched||[])),this.querySelector("[data-toggle-enabled]")?.addEventListener("change",n=>{e.enabled=n.target.checked}),this.querySelector("[data-toggle-default]")?.addEventListener("click",()=>{this.opts.onDefault(!this.opts.isDefault),this.opts.isDefault=!this.opts.isDefault,t()});const a=this.querySelector("[data-clear-key]");a?.addEventListener("click",()=>E(a,()=>{e.clearApiKey=!0,e.apiKey="",t()},"Tap again to remove")),this.querySelector("[data-undo-clear-key]")?.addEventListener("click",()=>{e.clearApiKey=!1,t()});const i=this.querySelector("[data-remove]");i?.addEventListener("click",()=>E(i,()=>{this.opts.onRemove(),this.close()},"Tap again to delete"))}};customElements.define("provider-form",ae);var ne=class extends HTMLElement{kind="chat";protocols=[];providers=[];defaultId=null;workersBinding=!1;configure(e,t,s,a,i=!1){this.kind=e,this.protocols=t,this.providers=s.map(n=>({...n,models:[...n.models||[]]})),this.defaultId=a,this.workersBinding=i,this.render()}get value(){return{providers:this.providers,defaultId:this.defaultId}}get backLabel(){return this.kind==="chat"?"Chat":"Image"}tint(e){const t=["var(--blue)","var(--purple)","var(--teal)","var(--orange)","var(--green)","var(--red)"];return t[e%t.length]}render(){const e=this.providers.map((s,a)=>{const i=this.defaultId===s.id,n=[s.model||"No model",`${s.models.length} model${s.models.length===1?"":"s"}`,s.enabled?"":"Disabled"].filter(Boolean).join(" \xB7 ");return`\n                <button type="button" class="list-row" data-edit="${l(s.id)}">\n                    <span class="row-icon" style="background:${this.tint(a)}">${l((s.label||s.protocol)[0].toUpperCase())}</span>\n                    <span class="row-main">\n                        <span class="row-title">${l(s.label||s.protocol)}</span>\n                        <span class="row-sub">${l(n)}</span>\n                    </span>\n                    ${i?`<span class="row-check">${o("check")}</span>`:""}\n                    ${o("chevron-right")}\n                </button>\n            `}).join(""),t=this.providers.length?"":\'<div class="list-row"><span class="row-main"><span class="row-sub">No providers yet. Add one to start chatting.</span></span></div>\';this.replaceChildren(d(`\n            <main>\n                <section class="list-group">\n                    <button type="button" class="list-row" data-add>\n                        <span class="row-icon" style="background:var(--green)">${o("plus")}</span>\n                        <span class="row-main"><span class="row-title">Add Provider</span><span class="row-sub">Custom API endpoint</span></span>\n                    </button>\n                </section>\n                <section class="list-group">${t}${e}</section>\n                <p class="group-footer">Tap a provider to edit its endpoint, models and options. The checkmark marks the default provider for ${this.kind==="chat"?"chat":"image generation"}.</p>\n            </main>\n        `)),this.querySelector("[data-add]")?.addEventListener("click",()=>{const s=this.protocols[0];if(!s)return;const a=this.blank(s);this.openForm(a,!0)}),this.querySelectorAll("[data-edit]").forEach(s=>{s.addEventListener("click",()=>{const a=this.providers.find(i=>i.id===s.dataset.edit);a&&this.openForm(a,!1)})})}blank(e){return{id:$(this.kind),protocol:e.id,label:"",enabled:!0,hasApiKey:!1,apiKey:"",baseUrl:e.defaultBaseUrl,model:"",models:[],extraParams:{},options:{}}}openForm(e,t){t&&this.providers.push(e),this.dispatchEvent(new CustomEvent("push",{bubbles:!0,composed:!0,detail:{title:t?"Add Provider":e.label||e.protocol,back:this.backLabel,onClose:()=>{t&&!e.models.length&&(this.providers=this.providers.filter(s=>s.id!==e.id)),this.render()},autosave:!0,mount:s=>{const a=document.createElement("provider-form");a.open(this.kind,this.protocols,e,{isDraft:t,isDefault:this.defaultId===e.id,workersBinding:this.workersBinding,onDefault:i=>{i?this.defaultId=e.id:this.defaultId===e.id&&(this.defaultId=null)},onRemove:()=>{this.providers=this.providers.filter(i=>i.id!==e.id),this.defaultId===e.id&&(this.defaultId=null)}}),s.replaceChildren(a)}}}))}};customElements.define("provider-page",ne);var ie=[{id:"all_private_chats",label:"Private Chats"},{id:"all_group_chats",label:"Group Chats"},{id:"all_chat_administrators",label:"Chat Administrators"}];function oe(e,t){if(t==="plugin")return"var(--orange)";const s=["var(--green)","var(--teal)","var(--blue)","var(--purple)"];return s[e%s.length]}var le=class extends HTMLElement{kind="plugin";item;opts;open(e,t,s){this.kind=e,this.item=t,this.opts=s,this.render()}close(){this.dispatchEvent(new CustomEvent("close",{bubbles:!0,composed:!0}))}render(){const e=this.item,t=ie.map(c=>`\n            <label class="list-row">\n                <span class="row-main"><span class="row-title">${c.label}</span><span class="row-sub">${c.id}</span></span>\n                <input type="checkbox" class="switch" data-scope="${c.id}" ${e.scope.includes(c.id)?"checked":""} aria-label="${c.label}" />\n            </label>`).join(""),s=this.kind==="plugin"?"Template":"Value",a=this.kind==="plugin"?"JSON or remote URL":\'/setenvs {"defaultChatProvider":"openai"} or any text\',i=this.kind==="plugin"?"JSON template or remote URL. The rendered result is sent as the reply":"Values starting with /setenv, /setenvs, /delenv or JSON are applied as a config patch (admin only); anything else expands as a text alias",n=this.kind==="plugin"?e.template:e.value,r=this.kind==="plugin"?`<h2 class="section-h">Environment</h2>\n                   <section class="list-group">\n                       <div class="row-stack">\n                           <span class="row-label">JSON key-value pairs, available when rendering the template</span>\n                           <textarea class="bare code" data-env placeholder=\'{"KEY":"value"}\' spellcheck="false">${l(JSON.stringify(e.env||{},null,2))}</textarea>\n                       </div>\n                   </section>`:"";this.replaceChildren(d(`\n            <main>\n                <h2 class="section-h">Command</h2>\n                <section class="list-group">\n                    <div class="row-field">\n                        <span class="row-label">Command</span>\n                        <input class="bare mono" data-field="command" value="${l(e.command)}" placeholder="/command" aria-label="Command" />\n                    </div>\n                    <div class="row-field">\n                        <span class="row-label">Description</span>\n                        <input class="bare" data-field="description" value="${l(e.description)}" placeholder="What it does" aria-label="Description" />\n                    </div>\n                    <label class="list-row">\n                        <span class="row-main"><span class="row-title">Enabled</span></span>\n                        <input type="checkbox" class="switch" data-field-enabled ${e.enabled?"checked":""} aria-label="Enabled" />\n                    </label>\n                </section>\n\n                <h2 class="section-h">Scope</h2>\n                <section class="list-group">${t}</section>\n                <p class="group-footer">Choose which chats expose the command. It is also registered in the Telegram command menu.</p>\n\n                <h2 class="section-h">${s}</h2>\n                <section class="list-group">\n                    <div class="row-stack">\n                        <span class="row-label">${i}</span>\n                        <textarea class="bare code" data-field-content placeholder="${l(a)}" spellcheck="false">${l(n)}</textarea>\n                    </div>\n                </section>\n                ${r}\n\n                <section class="list-group">\n                    <button type="button" class="list-row destructive" data-remove>Delete Command</button>\n                </section>\n            </main>\n        `)),this.bind()}bind(){const e=this.item;this.querySelector(\'[data-field="command"]\')?.addEventListener("input",s=>{e.command=s.target.value}),this.querySelector(\'[data-field="description"]\')?.addEventListener("input",s=>{e.description=s.target.value}),this.querySelector("[data-field-enabled]")?.addEventListener("change",s=>{e.enabled=s.target.checked}),this.querySelectorAll("[data-scope]").forEach(s=>{s.addEventListener("change",()=>{const a=s.dataset.scope;s.checked&&!e.scope.includes(a)?e.scope.push(a):s.checked||(e.scope=e.scope.filter(i=>i!==a))})}),this.querySelector("[data-field-content]")?.addEventListener("input",s=>{this.kind==="plugin"?e.template=s.target.value:e.value=s.target.value}),this.querySelector("[data-env]")?.addEventListener("input",s=>{try{e.env=JSON.parse(s.target.value||"{}")}catch{}});const t=this.querySelector("[data-remove]");t?.addEventListener("click",()=>E(t,()=>{this.opts.onRemove(),this.close()},"Tap again to delete"))}};customElements.define("item-form",le);var I=class extends HTMLElement{kind="plugin";items=[];set value(e){this.items=e.map(t=>({...t,scope:[...t.scope||[]],env:{...t.env}})),this.render()}get value(){return this.items}get addLabel(){return this.kind==="plugin"?"Add Plugin":"Add Command"}get backLabel(){return this.kind==="plugin"?"Plugins":"Commands"}blank(){return this.kind==="plugin"?{id:$("plugin"),command:"/",description:"",scope:[],template:"",env:{},enabled:!0}:{id:$("custom"),command:"/",description:"",scope:[],value:"",enabled:!0}}render(){const e=this.items.map((s,a)=>`\n                <button type="button" class="list-row" data-edit="${l(s.id)}">\n                    <span class="row-icon" style="background:${oe(a,this.kind)}">${o(this.kind==="plugin"?"puzzle":"terminal")}</span>\n                    <span class="row-main">\n                        <span class="row-title" style="font-family:var(--mono);font-size:15px">${l(s.command||"/")}</span>\n                        <span class="row-sub">${l(s.description||(s.enabled?"Enabled":"Disabled"))}</span>\n                    </span>\n                    ${s.enabled?"":\'<span class="row-value">Off</span>\'}\n                    ${o("chevron-right")}\n                </button>`).join(""),t=this.items.length?"":`<div class="list-row"><span class="row-main"><span class="row-sub">${this.kind==="plugin"?"No plugin commands yet.":"No custom commands yet."}</span></span></div>`;this.replaceChildren(d(`\n            <main>\n                <section class="list-group">\n                    <button type="button" class="list-row" data-add>\n                        <span class="row-icon" style="background:var(--green)">${o("plus")}</span>\n                        <span class="row-main"><span class="row-title">${this.addLabel}</span></span>\n                    </button>\n                </section>\n                <section class="list-group">${t}${e}</section>\n            </main>\n        `)),this.querySelector("[data-add]")?.addEventListener("click",()=>{const s=this.blank();this.items.push(s),this.openForm(s)}),this.querySelectorAll("[data-edit]").forEach(s=>{s.addEventListener("click",()=>{const a=this.items.find(i=>i.id===s.dataset.edit);a&&this.openForm(a)})})}openForm(e){this.dispatchEvent(new CustomEvent("push",{bubbles:!0,composed:!0,detail:{title:e.command||this.addLabel,back:this.backLabel,onClose:()=>this.render(),autosave:!0,mount:t=>{const s=document.createElement("item-form");s.open(this.kind,e,{onRemove:()=>{this.items=this.items.filter(a=>a.id!==e.id)}}),t.replaceChildren(s)}}}))}},re=class extends I{kind="plugin"};customElements.define("plugins-page",re);var ce=class extends I{kind="custom"};customElements.define("commands-page",ce);var w=[{id:"providers",label:"Chat",title:"Chat Providers",icon:"bot",tint:"var(--blue)"},{id:"image",label:"Image",title:"Image Providers",icon:"image",tint:"var(--purple)"},{id:"settings",label:"Settings",title:"Settings",icon:"gear",tint:"var(--text-3)"},{id:"plugins",label:"Plugins",title:"Plugins",icon:"puzzle",tint:"var(--orange)"},{id:"commands",label:"Commands",title:"Custom Commands",icon:"terminal",tint:"var(--green)"}],de=class extends HTMLElement{config=null;meta=null;agents=null;info=null;tab="providers";pages={};nav=null;connectedCallback(){this.addEventListener("logged-in",()=>this.load()),this.addEventListener("push",e=>{this.nav?.push(e.detail),this.updateFab()}),this.renderLoginGate()}renderLoginGate(){this.replaceChildren(d("<admin-login></admin-login>"))}async load(){try{[this.meta,this.config,this.agents,this.info]=await Promise.all([g.meta(),g.getConfig(),g.agents().catch(()=>({chat:null,image:null})),g.pageInfo().catch(()=>null)]),this.renderShell()}catch(e){f(e.message,!0),L(null),this.renderLoginGate()}}pageEl(e){return this.querySelector(`.page-root[data-tab="${e}"]`)}renderShell(){if(!this.config||!this.meta)return;const e=d(`\n            <div class="admin-app">\n                <nav-stack>\n                    ${w.map(t=>`<div class="page-root" data-tab="${t.id}" hidden></div>`).join("")}\n                </nav-stack>\n                <button type="button" class="save-fab" data-save>Save</button>\n                <nav class="tabbar" role="tablist" aria-label="Admin sections">\n                    ${w.map(t=>`<button type="button" role="tab" class="tab-btn" data-tab="${t.id}" aria-selected="${t.id===this.tab}">\n                            ${o(t.icon)}<span>${t.label}</span>\n                        </button>`).join("")}\n                </nav>\n            </div>\n        `);e.querySelectorAll(".tab-btn").forEach(t=>{t.addEventListener("click",()=>this.switchTab(t.dataset.tab))}),e.querySelector("[data-save]")?.addEventListener("click",()=>this.save()),this.nav=e.querySelector("nav-stack"),this.nav?.addEventListener("pop",t=>{t.detail?.autosave&&(this.collect(),this.persist()),this.updateFab()}),this.replaceChildren(e),this.pages={};for(const t of w)this.renderTab(t.id);this.activateTab(this.tab)}renderTab(e){const t=this.config,s=this.meta,a=this.pageEl(e),i=w.find(c=>c.id===e);if(!a)return;const n=d(`\n            <div>\n                <header class="navbar">\n                    <div class="nav-brand"><span class="nav-appicon" style="background:${i.tint}">${o(i.icon)}</span><strong>${i.title}</strong></div>\n                </header>\n            </div>\n        `);let r;if(e==="providers"||e==="image"){const c=e==="providers";r=document.createElement("provider-page"),r.configure(c?"chat":"image",c?s.chatProtocols:s.imageProtocols,c?t.chatProviders:t.imageProviders,c?t.defaultChatProvider:t.defaultImageProvider,s.workersBinding)}else e==="settings"?(r=document.createElement("settings-form"),r.value=t.settings,r.about={version:this.info?`${this.info.version} (${new Date(this.info.timestamp*1e3).toISOString().slice(0,10)})`:null,chat:this.agents?.chat??null,image:this.agents?.image??null}):e==="plugins"?(r=document.createElement("plugins-page"),r.value=t.plugins):(r=document.createElement("commands-page"),r.value=t.customCommands);this.pages[e]=r,n.append(r),a.replaceChildren(n)}activateTab(e){for(const t of w)this.pageEl(t.id)?.toggleAttribute("hidden",t.id!==e);this.querySelectorAll(".tab-btn").forEach(t=>{t.setAttribute("aria-selected",String(t.dataset.tab===e)),t.classList.toggle("active",t.dataset.tab===e)}),this.updateFab()}switchTab(e){e!==this.tab&&(this.nav?.pushed&&this.nav.popInstant(),this.collect(),this.tab=e,this.activateTab(e))}collect(){if(!this.config)return;const e=this.pages.providers;if(e){const{providers:s,defaultId:a}=e.value;this.config.chatProviders=s,this.config.defaultChatProvider=a}const t=this.pages.image;if(t){const{providers:s,defaultId:a}=t.value;this.config.imageProviders=s,this.config.defaultImageProvider=a}this.pages.settings&&(this.config.settings=this.pages.settings.value),this.pages.plugins&&(this.config.plugins=this.pages.plugins.value),this.pages.commands&&(this.config.customCommands=this.pages.commands.value)}async save(){const e=[...this.querySelectorAll("[data-save]")];if(!e.some(t=>t.disabled)){this.collect(),e.forEach(t=>{t.disabled=!0,t.textContent="Saving\u2026"});try{await this.persist(),this.nav?.pushed&&this.nav.popInstant(),await this.load()}catch(t){f(t.message,!0)}finally{e.forEach(t=>{t.disabled=!1,t.textContent="Save"})}}}async persist(){try{await g.saveConfig(this.config),f("Saved")}catch(e){f(e.message,!0)}}updateFab(){const e=this.querySelector(".save-fab");e&&(e.style.display=this.tab==="settings"||(this.nav?.pushed??!1)?"":"none")}};customElements.define("admin-app",de);var x={"/":{tag:"page-home",page:"home"},"/help":{tag:"page-help",page:"help"},"/init":{tag:"page-init",page:"init"},"/interpolate":{tag:"page-interpolate",page:"interpolate"},"/admin":{tag:"admin-app",page:"admin"}};function pe(){const e=location.pathname.replace(/\\/+$/,"")||"/",t=x[e]??x["/"];document.body.dataset.page=t.page;const s=document.getElementById("app");s&&s.replaceChildren(document.createElement(t.tag))}pe();\n\n</script>\n      <style>\n:root{--bg:#f2f2f7;--bg-elevated:#fff;--fill-1:#78788029;--fill-2:#78788042;--text:#000;--text-2:#6c6c70;--text-3:#8e8e93;--sep:#3c3c433d;--blue:#007aff;--green:#34c759;--red:#ff3b30;--orange:#ff9500;--purple:#af52de;--teal:#30b0c7;--nav-h:44px;--tab-h:49px;--radius-group:12px;--blur-bg:color-mix(in srgb, var(--bg) 78%, transparent);--font:-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;--mono:ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;--push-ease:cubic-bezier(.32, .72, 0, 1);--push-ms:.34s}@media (prefers-color-scheme:dark){:root{--bg:#000;--bg-elevated:#1c1c1e;--fill-1:#78788052;--fill-2:#78788070;--text:#fff;--text-2:#ebebf5a8;--text-3:#ebebf56b;--sep:#54545899;--blue:#0a84ff;--green:#30d158;--red:#ff453a;--orange:#ff9f0a;--purple:#bf5af2;--teal:#40cbe0;--blur-bg:color-mix(in srgb, var(--bg) 72%, transparent)}}*,:before,:after{box-sizing:border-box}html{-webkit-text-size-adjust:100%}body{background:var(--bg);min-height:100dvh;color:var(--text);font-family:var(--font);-webkit-font-smoothing:antialiased;margin:0;font-size:17px;line-height:1.45}h1,h2,h3,p{margin:0}a{color:var(--blue);text-decoration:none}:focus-visible{outline:2px solid var(--blue);outline-offset:-2px;border-radius:6px}::selection{background:color-mix(in srgb, var(--blue) 30%, transparent)}page-home,page-help,page-init,page-interpolate,admin-app{display:block}.icon{flex:none;width:22px;height:22px}.muted{color:var(--text-2);font-size:15px}.hidden{display:none!important}.contents{display:contents}main{max-width:640px;padding-top:16px;padding-bottom:calc(40px + env(safe-area-inset-bottom));margin:0 auto;display:block}.page-footer{color:var(--text-3);text-align:center;margin:8px 32px 0;font-size:13px}.navbar{z-index:20;height:calc(var(--nav-h) + env(safe-area-inset-top));padding:env(safe-area-inset-top) 0 0;background:var(--blur-bg);backdrop-filter:saturate(180%)blur(20px);align-items:center;display:flex;position:sticky;top:0}.navbar:after{content:"";background:var(--sep);height:1px;position:absolute;bottom:0;left:0;right:0}.nav-title{text-overflow:ellipsis;white-space:nowrap;pointer-events:none;max-width:46%;font-size:17px;font-weight:600;position:absolute;left:50%;overflow:hidden;transform:translate(-50%)}.nav-left,.nav-right{min-height:var(--nav-h);color:var(--blue);font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;background:0 0;border:0;align-items:center;gap:2px;padding:0 10px;font-size:17px;display:flex}.nav-left{margin-left:4px}.nav-left .icon{width:24px;height:24px;margin-left:-6px}.nav-left:active,.nav-right:active{opacity:.45}.nav-right{margin-left:auto;margin-right:8px;font-weight:600}.nav-right:disabled{opacity:.4;cursor:default}.nav-brand{align-items:center;gap:9px;min-width:0;padding:0 10px 0 16px;font-size:17px;font-weight:700;display:flex}.nav-brand strong{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.nav-appicon{background:var(--blue);color:#fff;border-radius:7px;flex:none;place-items:center;width:28px;height:28px;display:grid}.nav-appicon .icon{width:17px;height:17px}.nav-badge{background:var(--fill-1);color:var(--text-2);border-radius:999px;flex:none;margin-left:auto;margin-right:14px;padding:3px 9px;font-size:12px;font-weight:600}.admin-app{max-width:640px;min-height:100dvh;margin:0 auto;position:relative}.tabbar{z-index:30;width:100%;max-width:640px;height:calc(var(--tab-h) + env(safe-area-inset-bottom));padding-bottom:env(safe-area-inset-bottom);background:var(--blur-bg);backdrop-filter:saturate(180%)blur(20px);display:flex;position:fixed;bottom:0;left:50%;transform:translate(-50%)}.tabbar:before{content:"";background:var(--sep);height:1px;position:absolute;top:0;left:0;right:0}.tab-btn{min-width:0;color:var(--text-3);font:inherit;letter-spacing:.01em;cursor:pointer;-webkit-tap-highlight-color:transparent;background:0 0;border:0;flex-direction:column;flex:1 1 0;justify-content:flex-start;align-items:center;gap:1px;padding:5px 2px 0;font-size:10px;font-weight:500;display:flex}.tab-btn .icon{stroke-width:1.7px;width:26px;height:26px}.tab-btn:active{opacity:.55}.tab-btn.active{color:var(--blue)}.page-root{padding-bottom:calc(var(--tab-h) + env(safe-area-inset-bottom) + 28px)}nav-stack{display:block;position:relative}nav-stack.pushed{min-height:100dvh}.page-root{background:var(--bg);transition:transform var(--push-ms) var(--push-ease), opacity var(--push-ms) var(--push-ease)}.page-root[hidden]{display:none}nav-stack.pushed .page-root.active{opacity:.6;transform:translate(-26%)}.push-page{z-index:25;background:var(--bg);transition:transform var(--push-ms) var(--push-ease);overscroll-behavior:contain;flex-direction:column;display:flex;position:absolute;inset:0;transform:translate(100%)}.push-page.open{transform:translate(0)}.push-page.leaving{transform:translate(100%)}.push-content{-webkit-overflow-scrolling:touch;flex:auto;overflow-y:auto}.section-h{color:var(--text-2);text-transform:uppercase;letter-spacing:.04em;margin:6px 32px 8px;font-size:13px;font-weight:400}.section-h:first-child{margin-top:8px}.list-group{border-radius:var(--radius-group);background:var(--bg-elevated);margin:0 16px 24px;overflow:hidden}.list-row{width:100%;min-height:44px;color:inherit;font:inherit;text-align:left;-webkit-tap-highlight-color:transparent;background:0 0;border:0;align-items:center;gap:12px;padding:10px 16px;display:flex;position:relative}a.list-row,button.list-row,label.list-row{cursor:pointer}a.list-row:active,button.list-row:active,label.list-row:active{background:var(--fill-2)}.list-row+.list-row:before,.list-row+.row-stack:before,.list-row+.row-field:before,.row-stack+.list-row:before,.row-stack+.row-stack:before,.row-stack+.row-field:before,.row-field+.list-row:before,.row-field+.row-stack:before,.row-field+.row-field:before{content:"";background:var(--sep);height:1px;position:absolute;top:0;left:16px;right:0}.list-row.destructive{color:var(--red);justify-content:center;min-height:46px;font-size:17px}.list-row.destructive:active{background:0 0}.list-row.destructive.armed{background:var(--red);color:#fff}.row-icon{background:var(--blue);color:#fff;border-radius:7px;flex:none;place-items:center;width:29px;height:29px;display:grid}.row-icon .icon{width:17px;height:17px}.row-num{background:var(--fill-1);width:28px;height:28px;color:var(--text-2);border-radius:50%;flex:none;place-items:center;font-size:15px;font-weight:600;display:grid}.row-main{flex:auto;min-width:0}.row-title{overflow-wrap:anywhere;font-size:17px;line-height:1.3;display:block}.row-title.mono{font-family:var(--mono);font-size:15px}.row-sub{color:var(--text-2);overflow-wrap:anywhere;margin-top:1px;font-size:13px;line-height:1.4;display:block}.row-value{max-width:45%;color:var(--text-2);text-overflow:ellipsis;white-space:nowrap;flex:none;font-size:16px;overflow:hidden}.row-value.mono{font-family:var(--mono);font-size:13px}.row-chevron{color:var(--text-3);flex:none;width:17px;height:17px}.row-check{color:var(--blue);flex:none;display:flex}.row-check .icon{stroke-width:2.4px;width:19px;height:19px}.row-btn{color:var(--red);cursor:pointer;-webkit-tap-highlight-color:transparent;background:0 0;border:0;align-items:center;margin:-10px 0 -10px -12px;padding:10px;display:flex}.row-btn .icon{width:21px;height:21px}.row-btn:active{opacity:.45}.row-btn.blue{color:var(--blue);margin:-10px -12px -10px 0}.bare{min-width:0;color:var(--text);font:inherit;text-align:right;-webkit-tap-highlight-color:transparent;background:0 0;border:0;flex:1 1 0;padding:6px 0;font-size:17px}.bare::placeholder{color:var(--text-3)}.bare:focus,.bare:focus-visible{outline:none}.bare.mono{font-family:var(--mono);font-size:14px}.bare.left{text-align:left}select.bare{-webkit-appearance:none;appearance:none;text-align:right;color:var(--text-2);cursor:pointer;padding-right:0}input[type=number].bare::-webkit-inner-spin-button,input[type=number].bare::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.row-stack{padding:10px 16px 12px;display:block;position:relative}.row-stack .row-label{color:var(--text-2);margin-bottom:6px;font-size:13px;display:block}.row-field{padding:8px 16px 10px;display:block;position:relative}.row-field .row-label{color:var(--text-2);margin-bottom:3px;font-size:13px;line-height:1.3;display:block}.row-field .bare{text-align:left;text-overflow:ellipsis;width:100%;padding:2px 0 3px;display:block}.row-field select.bare{text-align:left}textarea.bare{text-align:left;resize:vertical;width:100%;min-height:96px;line-height:1.5;display:block}textarea.bare.code{font-family:var(--mono);min-height:120px;font-size:13.5px}.group-footer{color:var(--text-2);margin:-14px 32px 24px;font-size:13px;line-height:1.45}.row-main-btn{min-width:0;color:inherit;font:inherit;text-align:left;cursor:pointer;-webkit-tap-highlight-color:transparent;background:0 0;border:0;flex:auto;padding:0;display:block}.row-main-btn:active{opacity:.5}.row-value .spinner{border-width:2px;width:16px;height:16px;margin:4px 0}.switch{-webkit-appearance:none;appearance:none;background:var(--fill-1);cursor:pointer;border-radius:999px;flex:none;width:51px;height:31px;margin:0;transition:background .2s;position:relative}.switch:after{content:"";background:#fff;border-radius:50%;width:27px;height:27px;transition:transform .2s;position:absolute;top:2px;left:2px;box-shadow:0 2px 5px #00000047}.switch:checked{background:var(--green)}.switch:checked:after{transform:translate(20px)}.btn{background:var(--blue);color:#fff;width:100%;min-height:50px;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;border:0;border-radius:12px;justify-content:center;align-items:center;gap:8px;font-size:17px;font-weight:600;transition:filter .15s,opacity .15s;display:flex}.btn:active{filter:brightness(.82)}.btn:disabled{opacity:.45;cursor:default}.btn.gray{background:var(--fill-1);color:var(--text)}.btn.plain{color:var(--blue);background:0 0;min-height:44px}.btn-row{gap:12px;margin-bottom:24px;padding:0 16px;display:flex}.save-fab{left:50%;bottom:calc(var(--tab-h) + env(safe-area-inset-bottom) + 12px);z-index:31;background:var(--blue);color:#fff;width:min(100% - 32px,608px);height:44px;font:inherit;cursor:pointer;-webkit-tap-highlight-color:transparent;border:0;border-radius:12px;justify-content:center;align-items:center;font-size:16px;font-weight:600;transition:filter .15s,opacity .15s;display:flex;position:fixed;transform:translate(-50%);box-shadow:0 8px 24px #00000047}.save-fab:active{filter:brightness(.82)}.save-fab:disabled{opacity:.45;cursor:default}.admin-app main{padding-bottom:calc(var(--tab-h) + 72px + env(safe-area-inset-bottom))}.hero{text-align:center;flex-direction:column;align-items:center;gap:10px;padding:32px 24px 20px;display:flex}.app-icon{background:var(--blue);color:#fff;width:86px;height:86px;box-shadow:0 10px 26px color-mix(in srgb, var(--blue) 34%, transparent);border-radius:21px;place-items:center;display:grid}.app-icon .icon{stroke-width:1.6px;width:44px;height:44px}.hero h1{letter-spacing:-.4px;overflow-wrap:anywhere;font-size:28px;font-weight:800;line-height:1.15}.hero .muted{overflow-wrap:anywhere;max-width:420px}.status-chip{border-radius:999px;align-items:center;gap:6px;padding:6px 13px;font-size:15px;font-weight:600;display:inline-flex}.status-chip .icon{width:18px;height:18px}.status-chip.ok{background:color-mix(in srgb, var(--green) 15%, transparent);color:var(--green)}.status-chip.err{background:color-mix(in srgb, var(--red) 14%, transparent);color:var(--red)}.status-chip.warn{background:color-mix(in srgb, var(--orange) 16%, transparent);color:var(--orange)}.big-status{border-radius:50%;place-items:center;width:84px;height:84px;display:grid}.big-status.ok{color:var(--green);background:color-mix(in srgb, var(--green) 15%, transparent)}.big-status.err{color:var(--red);background:color-mix(in srgb, var(--red) 14%, transparent)}.big-status .icon{stroke-width:2px;width:42px;height:42px}.spinner{border:2.5px solid var(--fill-1);border-top-color:var(--blue);border-radius:50%;width:22px;height:22px;animation:.8s linear infinite spin}@keyframes spin{to{transform:rotate(360deg)}}.alert{border-radius:var(--radius-group);align-items:flex-start;gap:10px;width:100%;padding:12px 16px;font-size:15px;line-height:1.45;display:flex}.alert .icon{width:20px;height:20px;margin-top:1px}.alert.warn{background:color-mix(in srgb, var(--orange) 15%, transparent);color:color-mix(in srgb, var(--orange) 80%, var(--text))}.alert.err{background:color-mix(in srgb, var(--red) 13%, transparent);color:color-mix(in srgb, var(--red) 85%, var(--text))}.code-block{border-radius:var(--radius-group);background:var(--bg-elevated);-webkit-overflow-scrolling:touch;max-height:50dvh;margin:0 16px 24px;overflow:auto}.code-block pre{font-family:var(--mono);white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:13px 16px;font-size:13px;line-height:1.55}.toast{left:50%;bottom:max(28px, calc(env(safe-area-inset-bottom) + 16px));background:color-mix(in srgb, var(--bg-elevated) 90%, transparent);backdrop-filter:saturate(180%)blur(16px);max-width:calc(100vw - 40px);color:var(--text);opacity:0;pointer-events:none;z-index:40;border-radius:999px;padding:11px 20px;font-size:15px;font-weight:600;transition:opacity .22s,transform .22s;position:fixed;transform:translate(-50%)translateY(10px);box-shadow:0 6px 24px #00000038}.toast.error{color:var(--red)}.toast.show{opacity:1;transform:translate(-50%)translateY(0)}admin-app-body .toast,body[data-page=admin] .toast{bottom:calc(var(--tab-h) + env(safe-area-inset-bottom) + 18px)}.pg-grid{padding:12px 16px calc(20px + env(safe-area-inset-bottom));flex-direction:column;gap:12px;width:100%;max-width:1440px;margin:0 auto;display:flex}.pane{border-radius:var(--radius-group);background:var(--bg-elevated);flex-direction:column;min-height:0;display:flex;overflow:hidden}.pane-head{border-bottom:1px solid var(--sep);color:var(--text-2);text-transform:uppercase;letter-spacing:.05em;justify-content:space-between;align-items:center;gap:10px;padding:9px 14px;font-size:12px;font-weight:600;display:flex}.pane-head .icon{width:15px;height:15px}.pane textarea,.pane pre{min-height:0;color:var(--text);font-family:var(--mono);white-space:pre-wrap;overflow-wrap:anywhere;-webkit-overflow-scrolling:touch;resize:none;background:0 0;border:0;outline:none;flex:auto;margin:0;padding:12px 14px;font-size:13px;line-height:1.55;overflow:auto}.pane textarea{min-height:220px}.pane .error{color:var(--red)}@media (width>=900px){body[data-page=interpolate]{flex-direction:column;height:100dvh;display:flex;overflow:hidden}body[data-page=interpolate] page-interpolate{flex-direction:column;flex:1;min-height:0;display:flex}body[data-page=interpolate] .pg-grid{flex:auto;grid-template:"template data"minmax(0,1.15fr)"preview preview"minmax(0,1fr)/1fr 1fr;min-height:0;display:grid}body[data-page=interpolate] #template-area{grid-area:template}body[data-page=interpolate] #data-area{grid-area:data}body[data-page=interpolate] .preview-area{grid-area:preview}body[data-page=interpolate] .pane textarea{min-height:0}.hero{padding-top:64px}.hero h1{font-size:34px}}@media (width>=680px){.admin-app{border-left:1px solid var(--sep);border-right:1px solid var(--sep)}.push-page{width:640px;left:calc(50% - 320px);right:auto}}@media (prefers-reduced-motion:reduce){*,:before,:after{scroll-behavior:auto!important;transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}}\n/*$vite$:1*/\n</style>\n    </head>\n\n    <body>\n        <div id="app"></div>\n    </body>\n</html>\n';

// ../../lib/ai/dist/common.js
function contentToText(content) {
  if (typeof content === "string") {
    return content;
  }
  if (Array.isArray(content)) {
    return content.filter((item) => item?.type === "text").map((item) => item.text ?? "").join("");
  }
  return "";
}
function extractSystem(options) {
  const systems = [];
  if (options.system) {
    systems.push(options.system);
  }
  const messages = [];
  for (const message of options.messages) {
    if (message.role === "system") {
      const text = contentToText(message.content);
      if (text) {
        systems.push(text);
      }
    } else {
      messages.push(message);
    }
  }
  return { system: systems.length > 0 ? systems.join("\n\n") : void 0, messages };
}
function sumTokens(inputTokens, outputTokens) {
  if (inputTokens === void 0 || outputTokens === void 0) {
    return void 0;
  }
  return inputTokens + outputTokens;
}

// ../../lib/ai/dist/fetch.js
function joinUrl(base, path) {
  const trimmed = (base || "").replace(/\/+$/, "");
  const queryIndex = trimmed.indexOf("?");
  if (queryIndex === -1) {
    return `${trimmed}${path}`;
  }
  return `${trimmed.slice(0, queryIndex)}${path}${trimmed.slice(queryIndex)}`;
}
async function postJSON(url, options) {
  const doFetch = options.fetch || fetch;
  const response = await doFetch(url, {
    method: "POST",
    headers: options.headers,
    body: JSON.stringify(options.body),
    signal: options.signal
  });
  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }
  return response;
}
async function extractErrorMessage(response) {
  const fallback = `${response.status} ${response.statusText}`;
  try {
    const data = await response.json();
    return data?.error?.message || data?.errors?.[0]?.message || data?.message || fallback;
  } catch {
    return fallback;
  }
}
function parseJSONSync(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ../../lib/ai/dist/image.js
var DEFAULT_IMAGE_MIME_TYPE = "image/jpeg";
function bytesToBase64(bytes) {
  let binary = "";
  const chunkSize = 32768;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}
function toDataURI(base64, mimeType) {
  return `data:${mimeType};base64,${base64}`;
}
function normalizeBytes(image) {
  return image instanceof Uint8Array ? image : new Uint8Array(image);
}
function parseDataURI(url) {
  const match = /^data:([^;,]+);base64,(.+)$/s.exec(url);
  if (!match) {
    return null;
  }
  return { mimeType: match[1], base64: match[2] };
}
function resolveImage(image, defaultMimeType = DEFAULT_IMAGE_MIME_TYPE) {
  if (typeof image === "string" || image instanceof URL) {
    const url = image.toString();
    const dataURI = parseDataURI(url);
    if (dataURI) {
      return { base64: dataURI.base64, mimeType: dataURI.mimeType };
    }
    if (/^(https?|blob):/i.test(url)) {
      return { url };
    }
    return { base64: url, mimeType: defaultMimeType };
  }
  return { base64: bytesToBase64(normalizeBytes(image)), mimeType: defaultMimeType };
}
function imageFormatFromBase64(base64) {
  switch (base64.charAt(0)) {
    case "/":
      return "image/jpeg";
    case "i":
      return "image/png";
    case "U":
      return "image/webp";
    case "R":
      return "image/gif";
    default:
      throw new Error("Unsupported image format");
  }
}
var IMAGE_FETCH_CACHE = /* @__PURE__ */ new Map();
var IMAGE_FETCH_CACHE_MAX_ITEMS = 10;
var IMAGE_FETCH_CACHE_MAX_AGE = 1e3 * 60 * 60;
function cachedDataURI(url, doFetch) {
  const hit = IMAGE_FETCH_CACHE.get(url);
  if (hit && Date.now() - hit.time < IMAGE_FETCH_CACHE_MAX_AGE) {
    return hit.value;
  }
  if (IMAGE_FETCH_CACHE.size >= IMAGE_FETCH_CACHE_MAX_ITEMS) {
    const oldest = IMAGE_FETCH_CACHE.keys().next().value;
    if (oldest !== void 0) {
      IMAGE_FETCH_CACHE.delete(oldest);
    }
  }
  const value = fetchImageAsBase64(url, doFetch).then(({ base64, mimeType }) => toDataURI(base64, mimeType)).catch((e) => {
    IMAGE_FETCH_CACHE.delete(url);
    throw e;
  });
  IMAGE_FETCH_CACHE.set(url, { time: Date.now(), value });
  return value;
}
async function fetchImageAsBase64(url, doFetch = fetch) {
  const response = await doFetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image ${url}: ${response.status} ${response.statusText}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  const base64 = bytesToBase64(bytes);
  return { base64, mimeType: imageFormatFromBase64(base64) };
}
async function adaptMessageImages(messages, mode, doFetch = fetch) {
  if (mode === "url") {
    return messages;
  }
  const rendered = [];
  for (const message of messages) {
    if (typeof message.content === "string") {
      rendered.push(message);
      continue;
    }
    const parts = [];
    for (const part of message.content) {
      if (part.type !== "image") {
        parts.push(part);
        continue;
      }
      if (mode === "none") {
        continue;
      }
      const url = part.image instanceof URL ? part.image.href : typeof part.image === "string" ? part.image : null;
      if (url === null || url.startsWith("data:")) {
        parts.push(part);
        continue;
      }
      parts.push({ ...part, image: await cachedDataURI(url, doFetch) });
    }
    rendered.push({ role: message.role, content: parts });
  }
  return rendered;
}

// ../../lib/ai/dist/protocols.js
var WORKERS_FIELDS = [
  { key: "accountId", label: "Account ID", type: "text" },
  { key: "token", label: "API Token", type: "password" }
];
var WORKERS_ENDPOINT_FIELDS = { usesBaseUrl: false, usesApiKey: false };
var API_KEY_HEADER_FIELD = {
  key: "apiKeyHeader",
  label: "API Key Header",
  type: "text",
  placeholder: "api-key (Azure only)"
};
var CHAT_PROTOCOLS2 = [
  {
    id: "chat-completions",
    label: "OpenAI Chat Completions",
    defaultBaseUrl: "https://api.openai.com/v1",
    optionFields: [API_KEY_HEADER_FIELD],
    modelList: "openai",
    usesBaseUrl: true,
    usesApiKey: true
  },
  {
    id: "anthropic-messages",
    label: "Anthropic Messages",
    defaultBaseUrl: "https://api.anthropic.com/v1",
    modelList: "anthropic",
    usesBaseUrl: true,
    usesApiKey: true
  },
  {
    id: "responses",
    label: "OpenAI Responses",
    defaultBaseUrl: "https://api.openai.com/v1",
    optionFields: [API_KEY_HEADER_FIELD],
    modelList: "openai",
    usesBaseUrl: true,
    usesApiKey: true
  },
  {
    id: "workers",
    label: "Cloudflare Workers AI",
    defaultBaseUrl: "",
    optionFields: WORKERS_FIELDS,
    modelList: "workers",
    ...WORKERS_ENDPOINT_FIELDS
  }
];
var IMAGE_PROTOCOLS2 = [
  {
    id: "images",
    label: "OpenAI Images",
    defaultBaseUrl: "https://api.openai.com/v1",
    modelList: "openai",
    usesBaseUrl: true,
    usesApiKey: true
  },
  {
    id: "workers",
    label: "Cloudflare Workers AI",
    defaultBaseUrl: "",
    optionFields: WORKERS_FIELDS,
    modelList: "workers",
    ...WORKERS_ENDPOINT_FIELDS
  }
];
var CHAT_IMAGE_SUPPORT = {
  "chat-completions": "both",
  "anthropic-messages": "inline",
  responses: "both",
  workers: "none"
};
function chatImageSupport(protocol) {
  return CHAT_IMAGE_SUPPORT[protocol] ?? "url";
}
function imageAdaptMode(protocol, imageTransfer) {
  switch (chatImageSupport(protocol)) {
    case "none":
      return "none";
    case "inline":
      return "base64";
    default:
      return imageTransfer === "base64" ? "base64" : "url";
  }
}
function findChatProtocol(id) {
  return CHAT_PROTOCOLS2.find((p) => p.id === id) ?? null;
}

// ../../lib/ai/dist/sse.js
function isDoneSentinel(data) {
  return data.trim().startsWith("[DONE]");
}
var LineDecoder = class _LineDecoder {
  static NEWLINE_REGEXP = /\r\n|[\n\r]/g;
  buffer = "";
  trailingCR = false;
  textDecoder = null;
  decode(chunk) {
    let text = this.decodeText(chunk);
    if (this.trailingCR) {
      text = `\r${text}`;
      this.trailingCR = false;
    }
    if (text.endsWith("\r")) {
      this.trailingCR = true;
      text = text.slice(0, -1);
    }
    if (!text) {
      return [];
    }
    const trailingNewline = text[text.length - 1] === "\n" || text[text.length - 1] === "\r";
    let lines = text.split(_LineDecoder.NEWLINE_REGEXP);
    if (lines.length === 1 && !trailingNewline) {
      this.buffer += lines[0];
      return [];
    }
    if (this.buffer.length > 0) {
      lines = [this.buffer + lines[0], ...lines.slice(1)];
      this.buffer = "";
    }
    if (!trailingNewline) {
      this.buffer = lines.pop() || "";
    }
    return lines;
  }
  flush() {
    const lines = this.buffer ? [this.buffer] : [];
    this.buffer = "";
    this.trailingCR = false;
    return lines;
  }
  decodeText(chunk) {
    if (!this.textDecoder) {
      this.textDecoder = new TextDecoder("utf-8");
    }
    return this.textDecoder.decode(chunk, { stream: true });
  }
};
var SSEDecoder = class {
  event = null;
  data = [];
  decode(line) {
    if (line.endsWith("\r")) {
      line = line.substring(0, line.length - 1);
    }
    if (!line) {
      if (this.event === null && this.data.length === 0) {
        return null;
      }
      const sse = {
        event: this.event,
        data: this.data.join("\n")
      };
      this.event = null;
      this.data = [];
      return sse;
    }
    if (line.startsWith(":")) {
      return null;
    }
    const index = line.indexOf(":");
    const fieldName = index === -1 ? line : line.substring(0, index);
    let value = index === -1 ? "" : line.substring(index + 1);
    if (value.startsWith(" ")) {
      value = value.substring(1);
    }
    if (fieldName === "event") {
      this.event = value;
    } else if (fieldName === "data") {
      this.data.push(value);
    }
    return null;
  }
  flush() {
    if (this.event === null && this.data.length === 0) {
      return null;
    }
    const sse = {
      event: this.event,
      data: this.data.join("\n")
    };
    this.event = null;
    this.data = [];
    return sse;
  }
};
async function* iterSSEMessages(response) {
  if (!response.body) {
    throw new Error("Attempted to iterate over a response with no body");
  }
  const lineDecoder = new LineDecoder();
  const sseDecoder = new SSEDecoder();
  const reader = response.body.getReader();
  try {
    let done = false;
    while (!done) {
      const result = await reader.read();
      done = result.done;
      if (result.value) {
        for (const line of lineDecoder.decode(result.value)) {
          const sse = sseDecoder.decode(line);
          if (sse) {
            yield sse;
          }
        }
      }
    }
    for (const line of lineDecoder.flush()) {
      const sse = sseDecoder.decode(line);
      if (sse) {
        yield sse;
      }
    }
    const remaining = sseDecoder.flush();
    if (remaining) {
      yield remaining;
    }
  } finally {
    reader.cancel().catch(() => {
    });
  }
}

// ../../lib/ai/dist/anthropic-messages.js
var DEFAULT_BASE_URL = "https://api.anthropic.com/v1";
var ANTHROPIC_VERSION = "2023-06-01";
var DEFAULT_MAX_TOKENS = 4096;
function toUsage(usage) {
  if (!usage) {
    return void 0;
  }
  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  return {
    inputTokens,
    outputTokens,
    totalTokens: sumTokens(inputTokens, outputTokens)
  };
}
function renderPart(part) {
  if (part.type === "text") {
    return { type: "text", text: part.text };
  }
  const image = resolveImage(part.image, part.mimeType || DEFAULT_IMAGE_MIME_TYPE);
  if (image.base64) {
    return {
      type: "image",
      source: { type: "base64", media_type: image.mimeType || DEFAULT_IMAGE_MIME_TYPE, data: image.base64 }
    };
  }
  return null;
}
function renderContent(content) {
  if (typeof content === "string") {
    return content;
  }
  return content.map(renderPart).filter((part) => part !== null);
}
function buildAnthropicMessagesBody(options, stream) {
  const { system, messages } = extractSystem(options);
  return {
    ...options.extra,
    model: options.model,
    max_tokens: options.maxTokens ?? DEFAULT_MAX_TOKENS,
    ...system ? { system } : {},
    ...options.temperature !== void 0 ? { temperature: options.temperature } : {},
    ...options.topP !== void 0 ? { top_p: options.topP } : {},
    ...options.stop ? { stop_sequences: Array.isArray(options.stop) ? options.stop : [options.stop] } : {},
    ...stream ? { stream: true } : {},
    messages: messages.map((message) => ({
      role: message.role,
      content: renderContent(message.content)
    }))
  };
}
function parseAnthropicMessagesResponse(data) {
  if (data?.error) {
    throw new Error(data.error.message || "Unknown error");
  }
  return {
    text: contentToText(data?.content),
    usage: toUsage(data?.usage),
    stopReason: data?.stop_reason ?? null
  };
}
function parseAnthropicMessagesSSE(sse) {
  if (isDoneSentinel(sse.data)) {
    return { finish: true };
  }
  const payload = parseJSONSync(sse.data);
  if (!payload) {
    return {};
  }
  switch (payload.type) {
    case "content_block_delta":
      if (payload.delta?.type === "text_delta" && typeof payload.delta.text === "string") {
        return { delta: payload.delta.text };
      }
      return {};
    case "message_stop":
      return { finish: true };
    case "error":
      return { error: payload.error?.message || "Unknown error" };
    default:
      return {};
  }
}
var AnthropicMessagesClient = class {
  protocol = "anthropic-messages";
  config;
  constructor(config = {}) {
    this.config = config;
  }
  endpoint() {
    return joinUrl(this.config.baseUrl || DEFAULT_BASE_URL, "/messages");
  }
  headers(options, stream) {
    return {
      "content-type": "application/json",
      ...stream ? { accept: "text/event-stream" } : {},
      ...this.config.apiKey ? { "x-api-key": this.config.apiKey } : {},
      "anthropic-version": ANTHROPIC_VERSION,
      ...this.config.headers,
      ...options.headers
    };
  }
  async request(options, stream) {
    const mode = imageAdaptMode(this.protocol, this.config.imageTransfer);
    const adapted = { ...options, messages: await adaptMessageImages(options.messages, mode, this.config.fetch) };
    return postJSON(this.endpoint(), {
      headers: this.headers(options, stream),
      body: buildAnthropicMessagesBody(adapted, stream),
      signal: options.signal,
      fetch: this.config.fetch
    });
  }
  async complete(options) {
    const response = await this.request(options, false);
    return parseAnthropicMessagesResponse(await response.json());
  }
  async *stream(options) {
    const response = await this.request(options, true);
    for await (const sse of iterSSEMessages(response)) {
      const { delta, finish, error } = parseAnthropicMessagesSSE(sse);
      if (error) {
        throw new Error(error);
      }
      if (finish) {
        return;
      }
      if (delta) {
        yield delta;
      }
    }
  }
};

// ../../lib/ai/dist/chat-completions.js
var DEFAULT_BASE_URL2 = "https://api.openai.com/v1";
function toUsage2(usage) {
  if (!usage) {
    return void 0;
  }
  const inputTokens = usage.prompt_tokens;
  const outputTokens = usage.completion_tokens;
  return {
    inputTokens,
    outputTokens,
    totalTokens: usage.total_tokens ?? sumTokens(inputTokens, outputTokens)
  };
}
function renderPart2(part) {
  if (part.type === "text") {
    return { type: "text", text: part.text };
  }
  const image = resolveImage(part.image, part.mimeType || DEFAULT_IMAGE_MIME_TYPE);
  if (image.base64) {
    return {
      type: "image_url",
      image_url: { url: toDataURI(image.base64, image.mimeType || DEFAULT_IMAGE_MIME_TYPE) }
    };
  }
  if (image.url) {
    return { type: "image_url", image_url: { url: image.url } };
  }
  return null;
}
function renderMessage(message) {
  if (typeof message.content === "string") {
    return { role: message.role, content: message.content };
  }
  return {
    role: message.role,
    content: message.content.map(renderPart2).filter((part) => part !== null)
  };
}
function buildChatCompletionsBody(options, stream) {
  const messages = [...options.messages];
  if (options.system) {
    messages.unshift({ role: "system", content: options.system });
  }
  return {
    ...options.extra,
    model: options.model,
    ...stream ? { stream: true } : {},
    ...options.maxTokens !== void 0 ? { max_tokens: options.maxTokens } : {},
    ...options.temperature !== void 0 ? { temperature: options.temperature } : {},
    ...options.topP !== void 0 ? { top_p: options.topP } : {},
    ...options.stop ? { stop: options.stop } : {},
    messages: messages.map(renderMessage)
  };
}
function parseChatCompletionsResponse(data) {
  if (data?.error) {
    throw new Error(data.error.message || "Unknown error");
  }
  const choice = data?.choices?.at(0);
  if (!choice) {
    throw new Error("Empty response from provider");
  }
  return {
    text: contentToText(choice.message?.content),
    usage: toUsage2(data?.usage),
    stopReason: choice?.finish_reason ?? null
  };
}
function parseChatCompletionsSSE(sse) {
  if (isDoneSentinel(sse.data)) {
    return { finish: true };
  }
  const payload = parseJSONSync(sse.data);
  if (!payload) {
    return {};
  }
  if (payload.error) {
    return { error: payload.error.message || "Unknown error" };
  }
  const delta = payload.choices?.at(0)?.delta?.content;
  return typeof delta === "string" ? { delta } : {};
}
var ChatCompletionsClient = class {
  protocol = "chat-completions";
  config;
  constructor(config = {}) {
    this.config = config;
  }
  endpoint() {
    return joinUrl(this.config.baseUrl || DEFAULT_BASE_URL2, "/chat/completions");
  }
  headers(options, stream) {
    const keyHeader = this.config.apiKeyHeader || "authorization";
    const apiKeyValue = this.config.apiKeyHeader ? this.config.apiKey : `Bearer ${this.config.apiKey}`;
    return {
      "content-type": "application/json",
      ...stream ? { accept: "text/event-stream" } : {},
      ...this.config.apiKey ? { [keyHeader]: apiKeyValue } : {},
      ...this.config.headers,
      ...options.headers
    };
  }
  async request(options, stream) {
    const mode = imageAdaptMode(this.protocol, this.config.imageTransfer);
    const adapted = { ...options, messages: await adaptMessageImages(options.messages, mode, this.config.fetch) };
    return postJSON(this.endpoint(), {
      headers: this.headers(options, stream),
      body: buildChatCompletionsBody(adapted, stream),
      signal: options.signal,
      fetch: this.config.fetch
    });
  }
  async complete(options) {
    const response = await this.request(options, false);
    return parseChatCompletionsResponse(await response.json());
  }
  async *stream(options) {
    const response = await this.request(options, true);
    for await (const sse of iterSSEMessages(response)) {
      const { delta, finish, error } = parseChatCompletionsSSE(sse);
      if (error) {
        throw new Error(error);
      }
      if (finish) {
        return;
      }
      if (delta) {
        yield delta;
      }
    }
  }
};

// ../../lib/ai/dist/responses.js
var DEFAULT_BASE_URL3 = "https://api.openai.com/v1";
function toUsage3(usage) {
  if (!usage) {
    return void 0;
  }
  const inputTokens = usage.input_tokens;
  const outputTokens = usage.output_tokens;
  return {
    inputTokens,
    outputTokens,
    totalTokens: usage.total_tokens ?? sumTokens(inputTokens, outputTokens)
  };
}
function textPartType(role) {
  return role === "assistant" ? "output_text" : "input_text";
}
function renderPart3(part, role) {
  if (part.type === "text") {
    return { type: textPartType(role), text: part.text };
  }
  const image = resolveImage(part.image, part.mimeType || DEFAULT_IMAGE_MIME_TYPE);
  if (image.base64) {
    return { type: "input_image", image_url: toDataURI(image.base64, image.mimeType || DEFAULT_IMAGE_MIME_TYPE) };
  }
  if (image.url) {
    return { type: "input_image", image_url: image.url };
  }
  return null;
}
function renderContent2(message) {
  if (typeof message.content === "string") {
    return [{ type: textPartType(message.role), text: message.content }];
  }
  return message.content.map((part) => renderPart3(part, message.role)).filter((part) => part !== null);
}
function buildResponsesBody(options, stream) {
  const { system, messages } = extractSystem(options);
  return {
    ...options.extra,
    model: options.model,
    ...system ? { instructions: system } : {},
    ...stream ? { stream: true } : {},
    ...options.maxTokens !== void 0 ? { max_output_tokens: options.maxTokens } : {},
    ...options.temperature !== void 0 ? { temperature: options.temperature } : {},
    ...options.topP !== void 0 ? { top_p: options.topP } : {},
    input: messages.map((message) => ({
      role: message.role,
      content: renderContent2(message)
    }))
  };
}
function parseResponsesResponse(data) {
  if (data?.error) {
    throw new Error(data.error.message || "Unknown error");
  }
  const text = (data?.output || []).flatMap((item) => item?.content || []).filter((item) => item?.type === "output_text").map((item) => item.text ?? "").join("");
  const incomplete = data?.incomplete_details?.reason;
  return {
    text,
    usage: toUsage3(data?.usage),
    stopReason: incomplete ?? (data?.status === "completed" ? "stop" : null)
  };
}
function parseResponsesSSE(sse) {
  if (isDoneSentinel(sse.data)) {
    return { finish: true };
  }
  const payload = parseJSONSync(sse.data);
  if (!payload) {
    return {};
  }
  switch (payload.type || sse.event) {
    case "response.output_text.delta":
      return typeof payload.delta === "string" ? { delta: payload.delta } : {};
    case "response.completed":
    case "response.incomplete":
      return { finish: true };
    case "response.failed":
      return { error: payload.response?.error?.message || "Response failed" };
    case "error":
      return { error: payload.message || "Unknown error" };
    default:
      return {};
  }
}
var ResponsesClient = class {
  protocol = "responses";
  config;
  constructor(config = {}) {
    this.config = config;
  }
  endpoint() {
    return joinUrl(this.config.baseUrl || DEFAULT_BASE_URL3, "/responses");
  }
  headers(options, stream) {
    const keyHeader = this.config.apiKeyHeader || "authorization";
    const apiKeyValue = this.config.apiKeyHeader ? this.config.apiKey : `Bearer ${this.config.apiKey}`;
    return {
      "content-type": "application/json",
      ...stream ? { accept: "text/event-stream" } : {},
      ...this.config.apiKey ? { [keyHeader]: apiKeyValue } : {},
      ...this.config.headers,
      ...options.headers
    };
  }
  async request(options, stream) {
    const mode = imageAdaptMode(this.protocol, this.config.imageTransfer);
    const adapted = { ...options, messages: await adaptMessageImages(options.messages, mode, this.config.fetch) };
    return postJSON(this.endpoint(), {
      headers: this.headers(options, stream),
      body: buildResponsesBody(adapted, stream),
      signal: options.signal,
      fetch: this.config.fetch
    });
  }
  async complete(options) {
    const response = await this.request(options, false);
    return parseResponsesResponse(await response.json());
  }
  async *stream(options) {
    const response = await this.request(options, true);
    for await (const sse of iterSSEMessages(response)) {
      const { delta, finish, error } = parseResponsesSSE(sse);
      if (error) {
        throw new Error(error);
      }
      if (finish) {
        return;
      }
      if (delta) {
        yield delta;
      }
    }
  }
};

// ../../lib/ai/dist/workers-ai.js
function workersCredentials(options) {
  const pick = (key) => {
    const value = options?.[key];
    return typeof value === "string" ? value.trim() : "";
  };
  return { accountId: pick("accountId"), token: pick("token") };
}
function workersApiBaseUrl(accountId) {
  return `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai`;
}
function workersChatBaseUrl(accountId) {
  return `${workersApiBaseUrl(accountId)}/v1`;
}
function workersImageRunUrl(accountId, model) {
  return `${workersApiBaseUrl(accountId)}/run/${model}`;
}
function parseWorkersSSE(sse) {
  if (isDoneSentinel(sse.data)) {
    return { finish: true };
  }
  const payload = parseJSONSync(sse.data);
  const error = payload?.errors?.[0]?.message;
  if (typeof error === "string" && error) {
    return { error };
  }
  const delta = payload?.response;
  return typeof delta === "string" ? { delta } : {};
}
async function* bindingTextStream(output) {
  if (!(output instanceof ReadableStream)) {
    yield* bindingOutputToText(output);
    return;
  }
  const response = new Response(output, { headers: { "content-type": "text/event-stream" } });
  for await (const sse of iterSSEMessages(response)) {
    const { delta, finish, error } = parseWorkersSSE(sse);
    if (error) {
      throw new Error(error);
    }
    if (finish) {
      return;
    }
    if (delta) {
      yield delta;
    }
  }
}
function bindingOutputToText(output) {
  const error = output.errors?.[0]?.message;
  if (error) {
    throw new Error(error);
  }
  if (output instanceof ReadableStream) {
    throw new Error("Unexpected streaming output for a non-streaming request");
  }
  const response = output.response;
  return typeof response === "string" ? response : "";
}
function bindingImageResponse(output) {
  if (output instanceof ReadableStream) {
    return new Response(output, { headers: { "content-type": "image/jpeg" } });
  }
  return Response.json({ result: output });
}
function base64ToBlob(base64, mimeType) {
  const binary = atob(base64);
  return new Blob([Uint8Array.from(binary, (c) => c.charCodeAt(0))], { type: mimeType });
}
async function workersImageToBlob(output) {
  const contentType = output.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    const { result } = await output.json();
    const image = result?.image;
    if (typeof image !== "string") {
      throw new TypeError("Invalid image response");
    }
    return base64ToBlob(image, "image/png");
  }
  return output.blob();
}
var WorkersAIClient = class {
  protocol = "workers";
  config;
  fallback;
  constructor(config = {}) {
    this.config = config;
    this.fallback = config.binding ? null : new ChatCompletionsClient({
      ...config,
      baseUrl: config.baseUrl || (config.accountId ? workersChatBaseUrl(config.accountId) : void 0)
    });
  }
  bindingBody(options, stream) {
    const { model: _model, stream: _stream, ...body } = buildChatCompletionsBody(options, false);
    return { ...body, stream };
  }
  rest() {
    if (!this.config.baseUrl && !this.config.accountId) {
      throw new Error("Cloudflare account ID is required");
    }
    if (!this.fallback) {
      throw new Error("Cloudflare Workers AI binding is unavailable");
    }
    return this.fallback;
  }
  async adapt(options) {
    return { ...options, messages: await adaptMessageImages(options.messages, "none", this.config.fetch) };
  }
  async complete(options) {
    const adapted = await this.adapt(options);
    const binding = this.config.binding;
    if (!binding) {
      return this.rest().complete(adapted);
    }
    const output = await binding.run(adapted.model, this.bindingBody(adapted, false));
    return { text: bindingOutputToText(output) };
  }
  async *stream(options) {
    const adapted = await this.adapt(options);
    const binding = this.config.binding;
    if (!binding) {
      yield* this.rest().stream(adapted);
      return;
    }
    const output = await binding.run(adapted.model, this.bindingBody(adapted, true));
    yield* bindingTextStream(output);
  }
};
var MULTIPART_MODEL_PREFIXES = ["@cf/black-forest-labs/flux-2-"];
var MULTIPART_MODEL_CACHE = /* @__PURE__ */ new Set();
function isMultipartRequiredError(error) {
  const message = error instanceof Error ? error.message : String(error);
  return /multipart/i.test(message) && /required\s+propert/i.test(message);
}
function needsMultipart(model) {
  return MULTIPART_MODEL_CACHE.has(model) || MULTIPART_MODEL_PREFIXES.some((prefix) => model.startsWith(prefix));
}
function toImageFormData(body) {
  const form = new FormData();
  for (const [key, value] of Object.entries(body)) {
    if (value === void 0 || value === null || value === "") {
      continue;
    }
    form.append(key, String(value));
  }
  return form;
}
function workersImageMultipartInput(body) {
  const response = new Response(toImageFormData(body));
  return {
    multipart: {
      body: response.body,
      contentType: response.headers.get("content-type")
    }
  };
}
async function restErrorDetail(response) {
  const fallback = `Cloudflare Workers AI request failed: ${response.status} ${response.statusText}`;
  try {
    const data = await response.json();
    const error = data?.errors?.[0];
    if (error?.message) {
      return error.code ? `${error.code}: ${error.message}` : String(error.message);
    }
  } catch {
  }
  return fallback;
}
async function generateViaBinding(options, body) {
  const binding = options.binding;
  if (needsMultipart(options.model)) {
    return binding.run(options.model, workersImageMultipartInput(body));
  }
  try {
    return await binding.run(options.model, body);
  } catch (e) {
    if (!isMultipartRequiredError(e)) {
      throw e;
    }
    MULTIPART_MODEL_CACHE.add(options.model);
    return binding.run(options.model, workersImageMultipartInput(body));
  }
}
async function generateViaRest(options, body) {
  const doFetch = options.fetch || fetch;
  const url = workersImageRunUrl(options.accountId, options.model);
  const auth = options.apiKey ? { Authorization: `Bearer ${options.apiKey}` } : {};
  if (needsMultipart(options.model)) {
    return doFetch(url, { method: "POST", headers: auth, body: toImageFormData(body) });
  }
  const response = await doFetch(url, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (response.ok) {
    return response;
  }
  const detail = await restErrorDetail(response.clone());
  if (!isMultipartRequiredError(detail)) {
    throw new Error(detail);
  }
  MULTIPART_MODEL_CACHE.add(options.model);
  return doFetch(url, { method: "POST", headers: auth, body: toImageFormData(body) });
}
async function generateWorkersImage(options) {
  const body = { ...options.extraParams, prompt: options.prompt };
  if (options.binding) {
    return workersImageToBlob(bindingImageResponse(await generateViaBinding(options, body)));
  }
  if (!options.accountId) {
    throw new Error("Cloudflare account ID is required");
  }
  const response = await generateViaRest(options, body);
  if (!response.ok) {
    throw new Error(await restErrorDetail(response.clone()));
  }
  return workersImageToBlob(response);
}

// ../../lib/ai/dist/images.js
async function generateOpenAIImage(config, prompt) {
  const base = (config.baseUrl || "https://api.openai.com/v1").replace(/\/+$/, "");
  const body = {
    ...config.extraParams,
    prompt,
    n: 1,
    model: config.model
  };
  const doFetch = config.fetch || fetch;
  const response = await doFetch(`${base}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (data?.error?.message) {
    throw new Error(data.error.message);
  }
  const url = data?.data?.at(0)?.url;
  if (typeof url !== "string" || !url) {
    throw new Error("Image generation returned no url");
  }
  return url;
}
function createImageClient(protocol, config) {
  if (protocol === "workers") {
    return {
      protocol,
      generate: (prompt) => generateWorkersImage({
        model: config.model,
        prompt,
        extraParams: config.extraParams,
        binding: config.binding,
        accountId: config.accountId,
        apiKey: config.apiKey,
        fetch: config.fetch
      })
    };
  }
  return {
    protocol,
    generate: (prompt) => generateOpenAIImage(config, prompt)
  };
}

// ../../lib/ai/dist/models.js
var OPENAI_DEFAULT_BASE = "https://api.openai.com/v1";
var ANTHROPIC_DEFAULT_BASE = "https://api.anthropic.com/v1";
function trimBase(url) {
  return url.trim().replace(/\/+$/, "");
}
async function getJSON(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    let detail = `${response.status} ${response.statusText}`;
    try {
      const data = await response.json();
      detail = data?.error?.message || data?.message || detail;
    } catch {
    }
    throw new Error(detail);
  }
  return response.json();
}
function idsFrom(data) {
  if (!Array.isArray(data?.data)) {
    return [];
  }
  return data.data.map((item) => item?.id).filter((id) => typeof id === "string" && id.length > 0);
}
function namesFrom(items) {
  return items.map((item) => item?.name).filter((name) => typeof name === "string" && name.length > 0);
}
var WORKERS_TASK = {
  chat: { query: "Text Generation", allow: ["textgeneration"] },
  image: { query: "Text-to-Image", allow: ["texttoimage"] }
};
function normalizeTask(value) {
  return typeof value === "string" ? value.toLowerCase().replace(/[^a-z0-9]/g, "") : "";
}
function taskNameOf(item) {
  const task = item?.task;
  if (typeof task === "string") {
    return task;
  }
  if (task && typeof task === "object" && typeof task.name === "string") {
    return task.name;
  }
  return "";
}
function filterByTask(items, allow) {
  return items.filter((item) => {
    const task = normalizeTask(taskNameOf(item));
    return !task || allow.includes(task);
  });
}
async function fetchModels(protocol, provider, kind) {
  switch (protocol) {
    case "chat-completions":
    case "responses":
    case "images": {
      const base = trimBase(provider.baseUrl) || OPENAI_DEFAULT_BASE;
      const data = await getJSON(`${base}/models`, {
        Authorization: `Bearer ${provider.apiKey}`
      });
      return idsFrom(data);
    }
    case "anthropic-messages": {
      const base = trimBase(provider.baseUrl) || ANTHROPIC_DEFAULT_BASE;
      const data = await getJSON(`${base}/models`, {
        "x-api-key": provider.apiKey,
        "anthropic-version": "2023-06-01"
      });
      return idsFrom(data);
    }
    case "workers": {
      const { query, allow } = WORKERS_TASK[kind];
      if (provider.binding?.models) {
        const found = await provider.binding.models({ task: query, per_page: 100 });
        return namesFrom(filterByTask(found ?? [], allow));
      }
      const { accountId, token } = workersCredentials(provider.options);
      if (!accountId || !token) {
        throw new Error("Cloudflare account ID and token are required");
      }
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/models/search?task=${encodeURIComponent(query)}`;
      const data = await getJSON(url, { Authorization: `Bearer ${token}` });
      if (!Array.isArray(data?.result)) {
        return [];
      }
      return namesFrom(filterByTask(data.result, allow));
    }
    default:
      return [];
  }
}

// ../../lib/ai/dist/index.js
function createClient(protocol, config = {}) {
  switch (protocol) {
    case "anthropic-messages":
      return new AnthropicMessagesClient(config);
    case "chat-completions":
      return new ChatCompletionsClient(config);
    case "responses":
      return new ResponsesClient(config);
    case "workers":
      return new WorkersAIClient(config);
    default:
      throw new Error(`Unknown protocol: ${protocol}`);
  }
}

// ../../lib/agent/dist/stream.js
var UPDATE_STEP = 30;
async function consumeTextStream(stream, onStream, minIntervalMs = 0) {
  let text = "";
  let emitted = 0;
  let lastEmitAt = 0;
  try {
    for await (const delta of stream) {
      text += delta;
      const now = Date.now();
      if (text.length - emitted < UPDATE_STEP || now - lastEmitAt < minIntervalMs) {
        continue;
      }
      emitted = text.length;
      lastEmitAt = now;
      await onStream(`${text}
...`);
    }
  } catch (e) {
    if (e?.name !== "AbortError") {
      text += `
Error: ${e.message}`;
    }
  }
  return text;
}

// ../../lib/agent/dist/providers.js
function chatAbortSignal(settings) {
  if (settings.chatCompleteApiTimeout <= 0) {
    return { clear: () => {
    } };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), settings.chatCompleteApiTimeout * 1e3);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}
function apiKeyHeader(provider) {
  const value = provider.options?.apiKeyHeader;
  return typeof value === "string" && value.trim() ? value.trim() : void 0;
}
function clientConfig(provider, settings) {
  return {
    baseUrl: provider.baseUrl || void 0,
    apiKey: provider.apiKey || void 0,
    apiKeyHeader: apiKeyHeader(provider),
    imageTransfer: settings.telegramImageTransferMode
  };
}
function createChatAgent(protocol, provider, settings) {
  const client = createClient(protocol, clientConfig(provider, settings));
  return {
    name: provider.id,
    label: provider.label || findChatProtocol(protocol)?.label || protocol,
    model: provider.model || provider.models[0] || "",
    modelList: async () => provider.models,
    chat: async (messages, onStream) => {
      const extra = provider.extraParams ?? {};
      const { signal, clear } = chatAbortSignal(settings);
      const options = {
        model: provider.model,
        system: settings.systemInitMessage || void 0,
        messages,
        signal,
        ...settings.maxOutputTokens > 0 ? { maxTokens: settings.maxOutputTokens } : {},
        ...Object.keys(extra).length ? { extra } : {}
      };
      try {
        if (onStream) {
          return await consumeTextStream(client.stream(options), onStream, settings.telegramMinStreamInterval);
        }
        return (await client.complete(options)).text;
      } finally {
        clear();
      }
    }
  };
}
function createImageAgent(provider) {
  const client = createImageClient("images", {
    model: provider.model,
    baseUrl: provider.baseUrl || void 0,
    apiKey: provider.apiKey || void 0,
    extraParams: provider.extraParams
  });
  return {
    name: provider.id,
    label: provider.label || "OpenAI Images",
    model: provider.model || provider.models[0] || "",
    modelList: async () => provider.models,
    generate: (prompt) => client.generate(prompt)
  };
}

// ../../lib/agent/dist/workersai.js
function createWorkersChat(provider, settings) {
  const { accountId, token } = workersCredentials(provider.options);
  const binding = ENV.AI_BINDING ?? void 0;
  if (!binding && (!accountId || !token)) {
    console.warn(`Workers provider "${provider.id}" skipped: missing AI binding or account id/token`);
    return null;
  }
  const client = createClient("workers", { binding, accountId, apiKey: token });
  return {
    name: provider.id,
    label: provider.label || "Cloudflare Workers AI",
    model: provider.model,
    modelList: async () => provider.models,
    chat: async (messages, onStream) => {
      const extra = provider.extraParams ?? {};
      const { signal, clear } = chatAbortSignal(settings);
      const options = {
        model: provider.model,
        system: settings.systemInitMessage || void 0,
        messages,
        signal,
        ...settings.maxOutputTokens > 0 ? { maxTokens: settings.maxOutputTokens } : {},
        ...Object.keys(extra).length ? { extra } : {}
      };
      try {
        if (onStream) {
          return await consumeTextStream(client.stream(options), onStream, settings.telegramMinStreamInterval);
        }
        return (await client.complete(options)).text;
      } finally {
        clear();
      }
    }
  };
}
function createWorkersImage(provider) {
  const { accountId, token } = workersCredentials(provider.options);
  const binding = ENV.AI_BINDING ?? void 0;
  if (!binding && (!accountId || !token)) {
    console.warn(`Workers image provider "${provider.id}" skipped: missing AI binding or account id/token`);
    return null;
  }
  const client = createImageClient("workers", {
    model: provider.model,
    extraParams: provider.extraParams,
    binding,
    accountId,
    apiKey: token
  });
  return {
    name: provider.id,
    label: provider.label || "Cloudflare Workers AI",
    model: provider.model,
    modelList: async () => provider.models,
    generate: (prompt) => client.generate(prompt)
  };
}

// ../../lib/agent/dist/agent.js
function buildChatAgents(config) {
  return config.chatProviders.filter((provider) => provider.enabled).map((provider) => provider.protocol === "workers" ? createWorkersChat(provider, config.settings) : createChatAgent(provider.protocol, provider, config.settings)).filter((agent) => agent !== null);
}
function buildImageAgents(config) {
  return config.imageProviders.filter((provider) => provider.enabled).map((provider) => provider.protocol === "workers" ? createWorkersImage(provider) : createImageAgent(provider)).filter((agent) => agent !== null);
}
function loadChatLLM(config) {
  const agents = buildChatAgents(config);
  if (config.defaultChatProvider) {
    const found = agents.find((agent) => agent.name === config.defaultChatProvider);
    if (found) {
      return found;
    }
  }
  return agents.at(0) ?? null;
}
function loadImageGen(config) {
  const agents = buildImageAgents(config);
  if (config.defaultImageProvider) {
    const found = agents.find((agent) => agent.name === config.defaultImageProvider);
    if (found) {
      return found;
    }
  }
  return agents.at(0) ?? null;
}

// ../../lib/agent/dist/chat.js
function textOf(message) {
  if (typeof message.content === "string") {
    return message.content;
  }
  return message.content.filter((part) => part.type === "text").map((part) => part.text).join("");
}
function trimHistory(history, maxLength, maxToken) {
  let list = history;
  if (maxLength >= 0 && list.length > maxLength) {
    list = list.slice(-maxLength);
  }
  if (maxToken > 0) {
    let tokens = 0;
    for (let i = list.length - 1; i >= 0; i--) {
      tokens += textOf(list[i]).length;
      if (tokens > maxToken) {
        list = list.slice(i + 1);
        break;
      }
    }
  }
  return list;
}
async function loadHistory(key, config) {
  let history = [];
  try {
    const parsed = JSON.parse(await ENV.DATABASE.get(key));
    if (Array.isArray(parsed)) {
      history = parsed;
    }
  } catch (e) {
    console.error(e);
  }
  const { autoTrimHistory, maxHistoryLength, maxTokenLength } = config.settings;
  if (autoTrimHistory && maxHistoryLength > 0) {
    history = trimHistory(history, maxHistoryLength, maxTokenLength);
  }
  return history;
}
function stripImages(message, placeholder) {
  if (typeof message.content === "string") {
    return message;
  }
  const imageCount = message.content.filter((part) => part.type === "image").length;
  const lastText = message.content.findLast((part) => part.type === "text");
  if (imageCount === 0 || !lastText) {
    return message;
  }
  const content = message.content.filter((part) => part.type !== "image").map((part) => part === lastText ? { type: "text", text: part.text + ` ${placeholder}`.repeat(imageCount) } : part);
  return { role: message.role, content };
}
async function requestCompletionsFromLLM(message, historyKey, config, agent, modifier, onStream) {
  if (!historyKey) {
    throw new Error("History key not found");
  }
  const { autoTrimHistory, maxHistoryLength, historyImagePlaceholder } = config.settings;
  const historyDisabled = autoTrimHistory && maxHistoryLength <= 0;
  let history = await loadHistory(historyKey, config);
  if (modifier) {
    const modified = modifier(history, message);
    history = modified.history;
    message = modified.message;
  }
  if (!message) {
    throw new Error("Message is empty");
  }
  const text = await agent.chat([...history, message], onStream);
  if (!historyDisabled) {
    const stored = historyImagePlaceholder ? stripImages(message, historyImagePlaceholder) : message;
    const next = [...history, stored, { role: "assistant", content: text }];
    await ENV.DATABASE.put(historyKey, JSON.stringify(next)).catch(console.error);
  }
  return text;
}

// ../../lib/core/dist/rpc.js
var RpcError = class extends Error {
  code;
  constructor(code, message) {
    super(message);
    this.name = "RpcError";
    this.code = code;
  }
};
function jsonResponse(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" }
  });
}
function createRpcHandler(methods) {
  return async (request, env) => {
    let payload;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse({ error: { code: -32700, message: "parse error" } });
    }
    const method = typeof payload?.method === "string" ? payload.method : "";
    if (!Object.prototype.hasOwnProperty.call(methods, method)) {
      return jsonResponse({ error: { code: -32601, message: `method not found: ${method}` } });
    }
    const handler = methods[method];
    try {
      const result = await handler(payload.params, { request, env });
      return jsonResponse({ result: result === void 0 ? null : result });
    } catch (e) {
      if (e instanceof RpcError) {
        return jsonResponse({ error: { code: e.code, message: e.message } });
      }
      console.error(e);
      return jsonResponse({ error: { code: -32603, message: "internal error" } });
    }
  };
}

// ../../lib/core/dist/admin/auth.js
var encoder = new TextEncoder();
var SESSION_TTL_SECONDS = 60 * 60 * 12;
var MAX_AUTH_AGE_SECONDS = 60 * 60 * 24;
function base64UrlEncode(bytes) {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function bytesToHex(bytes) {
  let hex = "";
  for (const b of bytes) {
    hex += b.toString(16).padStart(2, "0");
  }
  return hex;
}
function base64UrlDecode(input) {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - padded.length % 4) % 4));
  return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
async function hmac(key, data) {
  const cryptoKey = await crypto.subtle.importKey("raw", key, { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  return new Uint8Array(signature);
}
function timingSafeEqual(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}
async function validateInitData(initData, botToken) {
  if (!initData || !botToken) {
    return { ok: false, reason: "missing initData or token" };
  }
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) {
    return { ok: false, reason: "missing hash" };
  }
  params.delete("hash");
  const dataCheckString = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join("\n");
  const secretKey = await hmac(encoder.encode("WebAppData"), encoder.encode(botToken));
  const computed = bytesToHex(await hmac(secretKey, encoder.encode(dataCheckString)));
  if (!timingSafeEqual(encoder.encode(computed), encoder.encode(hash.toLowerCase()))) {
    return { ok: false, reason: "invalid hash" };
  }
  const authDate = Number(params.get("auth_date") || "0");
  if (!authDate || Math.floor(Date.now() / 1e3) - authDate > MAX_AUTH_AGE_SECONDS) {
    return { ok: false, reason: "expired" };
  }
  const userRaw = params.get("user");
  if (!userRaw) {
    return { ok: false, reason: "missing user" };
  }
  try {
    const user = JSON.parse(userRaw);
    if (!user?.id) {
      return { ok: false, reason: "invalid user" };
    }
    return { ok: true, user };
  } catch {
    return { ok: false, reason: "invalid user json" };
  }
}
var SESSION_KEY_LABEL = "ctw-admin-session";
async function createSession(userId, ttlSeconds = SESSION_TTL_SECONDS) {
  if (!ENV.TELEGRAM_TOKEN) {
    throw new Error("Cannot create admin session: TELEGRAM_TOKEN is not set");
  }
  const payload = JSON.stringify({ sub: userId, exp: Math.floor(Date.now() / 1e3) + ttlSeconds });
  const payloadB64 = base64UrlEncode(encoder.encode(payload));
  const key = await hmac(encoder.encode(SESSION_KEY_LABEL), encoder.encode(ENV.TELEGRAM_TOKEN));
  const sig = base64UrlEncode(await hmac(key, encoder.encode(payloadB64)));
  return `${payloadB64}.${sig}`;
}
async function verifySession(token) {
  if (!token || !ENV.TELEGRAM_TOKEN) {
    return null;
  }
  const [payloadB64, sig] = token.split(".");
  if (!payloadB64 || !sig) {
    return null;
  }
  const key = await hmac(encoder.encode(SESSION_KEY_LABEL), encoder.encode(ENV.TELEGRAM_TOKEN));
  const expected = base64UrlEncode(await hmac(key, encoder.encode(payloadB64)));
  if (!timingSafeEqual(encoder.encode(expected), encoder.encode(sig))) {
    return null;
  }
  try {
    const payload = JSON.parse(new TextDecoder().decode(base64UrlDecode(payloadB64)));
    if (payload.exp < Math.floor(Date.now() / 1e3)) {
      return null;
    }
    return payload.sub;
  } catch {
    return null;
  }
}
function checkPassword(password) {
  const expected = ENV.ADMIN_PASSWORD;
  if (!expected) {
    return false;
  }
  const a = encoder.encode(password || "");
  const b = encoder.encode(expected);
  if (a.length !== b.length) {
    return false;
  }
  return timingSafeEqual(a, b);
}
function isAdmin(userId) {
  return !!ENV.ADMIN_ID && `${userId}` === ENV.ADMIN_ID;
}
function extractBearer(header) {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (!token || scheme.toLowerCase() !== "bearer") {
    return null;
  }
  return token;
}

// ../../lib/core/dist/admin/api.js
async function requireAuth(request) {
  const userId = await verifySession(extractBearer(request.headers.get("Authorization")));
  if (!userId || !isAdmin(userId)) {
    throw new RpcError(401, "unauthorized");
  }
  return userId;
}
function createAdminMethods() {
  return {
    "admin.login": async (params) => {
      const body = params ?? {};
      if (body.initData) {
        const result = await validateInitData(body.initData, ENV.TELEGRAM_TOKEN);
        if (!result.ok) {
          throw new RpcError(401, `initData ${result.reason}`);
        }
        if (!isAdmin(result.user.id)) {
          throw new RpcError(403, "not admin");
        }
        return { token: await createSession(`${result.user.id}`) };
      }
      if (body.password !== void 0) {
        if (!ENV.ADMIN_PASSWORD) {
          throw new RpcError(400, "password login disabled");
        }
        if (!ENV.ADMIN_ID) {
          throw new RpcError(400, "ADMIN_ID must be set to use password login");
        }
        if (!checkPassword(body.password)) {
          throw new RpcError(401, "invalid password");
        }
        return { token: await createSession(ENV.ADMIN_ID) };
      }
      throw new RpcError(400, "missing credentials");
    },
    "admin.authInfo": () => ({
      passwordEnabled: !!ENV.ADMIN_PASSWORD && !!ENV.ADMIN_ID,
      hasAdminId: !!ENV.ADMIN_ID,
      hasToken: !!ENV.TELEGRAM_TOKEN
    }),
    "admin.meta": async (_params, ctx) => {
      await requireAuth(ctx.request);
      return {
        chatProtocols: CHAT_PROTOCOLS2,
        imageProtocols: IMAGE_PROTOCOLS2,
        workersBinding: !!ENV.AI_BINDING
      };
    },
    "admin.config.get": async (_params, ctx) => {
      await requireAuth(ctx.request);
      await ENV.loadConfig(true);
      return maskConfig(ENV.CONFIG);
    },
    "admin.config.save": async (params, ctx) => {
      await requireAuth(ctx.request);
      const incoming = params;
      const current = await ENV.loadConfig(true);
      const next = unmaskConfig(incoming, current);
      await ENV.getConfigStore().save(next);
      await ENV.loadConfig(true);
      return { ok: true };
    },
    "admin.agents": async (_params, ctx) => {
      await requireAuth(ctx.request);
      await ENV.loadConfig(true);
      const chat = loadChatLLM(ENV.CONFIG);
      const image = loadImageGen(ENV.CONFIG);
      return {
        chat: chat ? { name: chat.name, label: chat.label, model: chat.model } : null,
        image: image ? { name: image.name, label: image.label, model: image.model } : null
      };
    },
    "admin.models": async (params, ctx) => {
      await requireAuth(ctx.request);
      const body = params ?? {};
      if (!body.provider) {
        return { models: [] };
      }
      await ENV.loadConfig(true);
      try {
        const kind = body.kind === "image" ? "image" : "chat";
        const provider = unmaskProviderFromStore(body.provider, kind);
        const models = await fetchModels(provider.protocol, { ...provider, binding: ENV.AI_BINDING ?? void 0 }, kind);
        return { models };
      } catch (e) {
        throw new RpcError(400, e.message);
      }
    }
  };
}
function unmaskProviderFromStore(provider, kind) {
  const stored = (kind === "image" ? ENV.CONFIG.imageProviders : ENV.CONFIG.chatProviders).find((p) => p.id === provider.id);
  const options = { ...provider.options };
  for (const [key, value] of Object.entries(options)) {
    if (value === MASKED_API_KEY) {
      options[key] = stored?.options?.[key] ?? "";
    }
  }
  return {
    protocol: provider.protocol,
    baseUrl: provider.baseUrl,
    apiKey: unmaskKey(provider.apiKey, stored?.apiKey, provider.clearApiKey),
    options
  };
}

// ../../lib/core/dist/bot/auth.js
var TELEGRAM_AUTH_CHECKER = {
  default(chatType) {
    if (isGroupChat(chatType)) {
      return ["administrator", "creator"];
    }
    return null;
  },
  shareModeGroup(chatType) {
    if (isGroupChat(chatType)) {
      if (!ENV.CONFIG.settings.groupChatBotShareMode) {
        return null;
      }
      return ["administrator", "creator"];
    }
    return null;
  }
};
function isGroupChat(type) {
  return type === "group" || type === "supergroup";
}

// ../../lib/telegram/dist/transport.js
var DEFAULT_API_DOMAIN = "https://api.telegram.org";
var transportConfig = {};
function configureTelegram(config) {
  transportConfig = config;
}
function getTelegramConfig() {
  return transportConfig;
}

// ../../lib/telegram/dist/api/index.js
var APIClientBase = class {
  token;
  baseURL;
  constructor(token, baseURL) {
    this.token = token;
    const domain = baseURL || getTelegramConfig().apiDomain || DEFAULT_API_DOMAIN;
    this.baseURL = domain.replace(/\/+$/, "");
    this.request = this.request.bind(this);
    this.requestJSON = this.requestJSON.bind(this);
  }
  uri(method) {
    return `${this.baseURL}/bot${this.token}/${method}`;
  }
  jsonRequest(method, params) {
    return fetch(this.uri(method), {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(params)
    });
  }
  formDataRequest(method, params) {
    const formData = new FormData();
    for (const key in params) {
      const value = params[key];
      if (value instanceof File) {
        formData.append(key, value, value.name);
      } else if (value instanceof Blob) {
        formData.append(key, value, "blob");
      } else if (typeof value === "string") {
        formData.append(key, value);
      } else {
        formData.append(key, JSON.stringify(value));
      }
    }
    return fetch(this.uri(method), {
      method: "POST",
      body: formData
    });
  }
  request(method, params) {
    for (const key in params) {
      if (params[key] instanceof File || params[key] instanceof Blob) {
        return this.formDataRequest(method, params);
      }
    }
    return this.jsonRequest(method, params);
  }
  async requestJSON(method, params) {
    return this.request(method, params).then((res) => res.json());
  }
};
function createTelegramBotAPI(token, baseURL) {
  const client = new APIClientBase(token, baseURL);
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      return (...args) => {
        if (typeof prop === "string" && prop.endsWith("WithReturns")) {
          const method = prop.slice(0, -11);
          return Reflect.apply(target.requestJSON, target, [method, ...args]);
        }
        return Reflect.apply(target.request, target, [prop, ...args]);
      };
    }
  });
}

// ../../lib/telegram/dist/middleware.js
var Update2MessageHandler = class {
  messageHandlers;
  constructor(messageHandlers) {
    this.messageHandlers = messageHandlers;
  }
  loadMessage(body) {
    if (body.edited_message) {
      throw new Error("Ignore edited message");
    }
    if (body.message) {
      return body.message;
    }
    throw new Error("Invalid message");
  }
  handle = async (update, context) => {
    const message = this.loadMessage(update);
    for (const handler of this.messageHandlers) {
      const result = await handler.handle(message, context);
      if (result) {
        return result;
      }
    }
    return null;
  };
};

// ../../lib/telegram/dist/sender/index.js
var DEFAULT_PARSE_MODE = "Markdown";
var MessageContext = class _MessageContext {
  chat_id;
  message_id = null;
  reply_to_message_id = null;
  parse_mode = null;
  allow_sending_without_reply = null;
  disable_web_page_preview = null;
  constructor(chatID) {
    this.chat_id = chatID;
  }
  static fromMessage(message) {
    const ctx = new _MessageContext(message.chat.id);
    if (message.chat.type === "group" || message.chat.type === "supergroup") {
      ctx.reply_to_message_id = message.message_id;
      ctx.allow_sending_without_reply = true;
    } else {
      ctx.reply_to_message_id = null;
    }
    return ctx;
  }
  static fromCallbackQuery(callbackQuery) {
    const chat = callbackQuery.message?.chat;
    if (!chat) {
      throw new Error("Chat not found");
    }
    const ctx = new _MessageContext(chat.id);
    if (chat.type === "group" || chat.type === "supergroup") {
      ctx.reply_to_message_id = callbackQuery.message.message_id;
      ctx.allow_sending_without_reply = true;
    } else {
      ctx.reply_to_message_id = null;
    }
    return ctx;
  }
};
var MessageSender = class _MessageSender {
  api;
  context;
  constructor(token, context) {
    this.api = createTelegramBotAPI(token);
    this.context = context;
    this.sendRichText = this.sendRichText.bind(this);
    this.sendPlainText = this.sendPlainText.bind(this);
    this.sendPhoto = this.sendPhoto.bind(this);
  }
  static fromMessage(token, message) {
    return new _MessageSender(token, MessageContext.fromMessage(message));
  }
  static fromCallbackQuery(token, callbackQuery) {
    return new _MessageSender(token, MessageContext.fromCallbackQuery(callbackQuery));
  }
  static fromUpdate(token, update) {
    if (update.callback_query) {
      return _MessageSender.fromCallbackQuery(token, update.callback_query);
    }
    if (update.message) {
      return _MessageSender.fromMessage(token, update.message);
    }
    throw new Error("Invalid update");
  }
  update(context) {
    if (!this.context) {
      this.context = context;
      return this;
    }
    for (const key in context) {
      this.context[key] = context[key];
    }
    return this;
  }
  async sendMessage(message, context) {
    if (context?.message_id) {
      const params = {
        chat_id: context.chat_id,
        message_id: context.message_id,
        parse_mode: context.parse_mode || void 0,
        text: message
      };
      if (context.disable_web_page_preview) {
        params.link_preview_options = {
          is_disabled: true
        };
      }
      return this.api.editMessageText(params);
    } else {
      const params = {
        chat_id: context.chat_id,
        parse_mode: context.parse_mode || void 0,
        text: message
      };
      if (context.reply_to_message_id) {
        params.reply_parameters = {
          message_id: context.reply_to_message_id,
          chat_id: context.chat_id,
          allow_sending_without_reply: context.allow_sending_without_reply || void 0
        };
      }
      if (context.disable_web_page_preview) {
        params.link_preview_options = {
          is_disabled: true
        };
      }
      return this.api.sendMessage(params);
    }
  }
  renderMessage(parse_mode, message) {
    const render = getTelegramConfig().renderMessage;
    if (render) {
      return render(parse_mode, message);
    }
    return message;
  }
  async sendLongMessage(message, context) {
    const chatContext = { ...context };
    const limit = 4096;
    if (message.length <= limit) {
      const resp = await this.sendMessage(this.renderMessage(context.parse_mode, message), chatContext);
      if (resp.status === 200) {
        return resp;
      }
    }
    chatContext.parse_mode = null;
    let lastMessageResponse = null;
    for (let i = 0; i < message.length; i += limit) {
      const msg = message.slice(i, Math.min(i + limit, message.length));
      if (i > 0) {
        chatContext.message_id = null;
      }
      lastMessageResponse = await this.sendMessage(msg, chatContext);
      if (lastMessageResponse.status !== 200) {
        break;
      }
    }
    if (lastMessageResponse === null) {
      throw new Error("Send message failed");
    }
    return lastMessageResponse;
  }
  sendRawMessage(message) {
    return this.api.sendMessage(message);
  }
  editRawMessage(message) {
    return this.api.editMessageText(message);
  }
  sendRichText(message, parseMode = getTelegramConfig().defaultParseMode || DEFAULT_PARSE_MODE) {
    if (!this.context) {
      throw new Error("Message context not set");
    }
    return this.sendLongMessage(message, {
      ...this.context,
      parse_mode: parseMode
    });
  }
  sendPlainText(message) {
    if (!this.context) {
      throw new Error("Message context not set");
    }
    return this.sendLongMessage(message, {
      ...this.context,
      parse_mode: null
    });
  }
  sendPhoto(photo) {
    if (!this.context) {
      throw new Error("Message context not set");
    }
    const params = {
      chat_id: this.context.chat_id,
      photo
    };
    if (this.context.reply_to_message_id) {
      params.reply_parameters = {
        message_id: this.context.reply_to_message_id,
        chat_id: this.context.chat_id,
        allow_sending_without_reply: this.context.allow_sending_without_reply || void 0
      };
    }
    return this.api.sendPhoto(params);
  }
};

// ../../lib/core/dist/bot/chat/index.js
async function chatWithMessage(message, params, context, modifier) {
  const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
  try {
    try {
      const msg = await sender.sendPlainText("...").then((r) => r.json());
      sender.update({
        message_id: msg.result.message_id
      });
    } catch (e) {
      console.error(e);
    }
    const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
    setTimeout(() => api.sendChatAction({
      chat_id: message.chat.id,
      action: "typing"
    }).catch(console.error), 0);
    let onStream = null;
    let nextEnableTime = null;
    if (ENV.CONFIG.settings.streamMode) {
      onStream = async (text) => {
        try {
          if (nextEnableTime && nextEnableTime > Date.now()) {
            return;
          }
          const resp = await sender.sendPlainText(text);
          if (resp.status === 429) {
            const retryAfter = Number.parseInt(resp.headers.get("Retry-After") || "");
            if (retryAfter) {
              nextEnableTime = Date.now() + retryAfter * 1e3;
              return;
            }
          }
          nextEnableTime = null;
          if (resp.ok) {
            const respJson = await resp.json();
            sender.update({
              message_id: respJson.result.message_id
            });
          }
        } catch (e) {
          console.error(e);
        }
      };
    }
    const agent = loadChatLLM(ENV.CONFIG);
    if (agent === null) {
      return sender.sendPlainText("LLM is not enable");
    }
    const answer = await requestCompletionsFromLLM(params, context.SHARE_CONTEXT.chatHistoryKey, ENV.CONFIG, agent, modifier, onStream);
    if (nextEnableTime !== null && nextEnableTime > Date.now()) {
      await new Promise((resolve) => setTimeout(resolve, (nextEnableTime ?? 0) - Date.now()));
    }
    return sender.sendRichText(answer);
  } catch (e) {
    let errMsg = `Error: ${e.message}`;
    if (errMsg.length > 2048) {
      errMsg = errMsg.substring(0, 2048);
    }
    return sender.sendPlainText(errMsg);
  }
}
async function extractImageURL(fileId, context) {
  if (!fileId) {
    return null;
  }
  const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
  const file = await api.getFileWithReturns({ file_id: fileId });
  const filePath = file.result.file_path;
  if (filePath) {
    const url = URL.parse(`${ENV.CONFIG.settings.telegramApiDomain}/file/bot${context.SHARE_CONTEXT.botToken}/${filePath}`);
    if (url) {
      return url;
    }
  }
  return null;
}
function extractImageFileID(message) {
  if (message.photo && message.photo.length > 0) {
    const offset = ENV.CONFIG.settings.telegramPhotoSizeOffset;
    const length = message.photo.length;
    const sizeIndex = Math.max(0, Math.min(offset >= 0 ? offset : length + offset, length - 1));
    return message.photo[sizeIndex]?.file_id;
  } else if (message.document && message.document.thumbnail) {
    return message.document.thumbnail.file_id;
  }
  return null;
}
async function extractUserMessageItem(message, context) {
  const settings = ENV.CONFIG.settings;
  let text = message.text || message.caption || "";
  const urls = await extractImageURL(extractImageFileID(message), context).then((u) => u ? [u] : []);
  if (settings.extraMessageContext && message.reply_to_message && message.reply_to_message.from && `${message.reply_to_message.from.id}` !== `${context.SHARE_CONTEXT.botId}`) {
    const extraText = message.reply_to_message.text || message.reply_to_message.caption || "";
    if (extraText) {
      text = `${text}
The following is the referenced context: ${extraText}`;
    }
    if (settings.extraMessageMediaCompatible.includes("image") && message.reply_to_message.photo) {
      const url = await extractImageURL(extractImageFileID(message.reply_to_message), context);
      if (url) {
        urls.push(url);
      }
    }
  }
  const params = {
    role: "user",
    content: text
  };
  if (urls.length > 0) {
    const contents = new Array();
    if (text) {
      contents.push({ type: "text", text });
    }
    for (const url of urls) {
      contents.push({ type: "image", image: url });
    }
    params.content = contents;
  }
  return params;
}

// ../../lib/plugins/dist/interpolate.js
var INTERPOLATE_LOOP_REGEXP = /\{\{#each(?::(\w+))?\s+(\w+)\s+in\s+([\w.[\]]+)\}\}([\s\S]*?)\{\{\/each(?::\1)?\}\}/g;
var INTERPOLATE_CONDITION_REGEXP = /\{\{#if(?::(\w+))?\s+([\w.[\]]+)\}\}([\s\S]*?)(?:\{\{#else(?::\1)?\}\}([\s\S]*?))?\{\{\/if(?::\1)?\}\}/g;
var INTERPOLATE_VARIABLE_REGEXP = /\{\{([\w.[\]]+)\}\}/g;
function evaluateExpression(expr, localData) {
  if (expr === ".") {
    return localData["."] ?? localData;
  }
  try {
    return expr.split(".").reduce((value, key) => {
      if (key.includes("[") && key.includes("]")) {
        const [arrayKey, indexStr] = key.split("[");
        const indexExpr = indexStr.slice(0, -1);
        let index = Number.parseInt(indexExpr, 10);
        if (Number.isNaN(index)) {
          index = evaluateExpression(indexExpr, localData);
        }
        return value?.[arrayKey]?.[index];
      }
      return value?.[key];
    }, localData);
  } catch (error) {
    console.error(`Error evaluating expression: ${expr}`, error);
    return void 0;
  }
}
function interpolate(template, data, formatter) {
  const processConditional = (condition, trueBlock, falseBlock, localData) => {
    const result = evaluateExpression(condition, localData);
    return result ? trueBlock : falseBlock || "";
  };
  const processLoop = (itemName, arrayExpr, loopContent, localData) => {
    const array = evaluateExpression(arrayExpr, localData);
    if (!Array.isArray(array)) {
      console.warn(`Expression "${arrayExpr}" did not evaluate to an array`);
      return "";
    }
    return array.map((item) => {
      const itemData = { ...localData, [itemName]: item, ".": item };
      return interpolate(loopContent, itemData);
    }).join("");
  };
  const processTemplate = (tmpl, localData) => {
    tmpl = tmpl.replace(INTERPOLATE_LOOP_REGEXP, (_, alias, itemName, arrayExpr, loopContent) => processLoop(itemName, arrayExpr, loopContent, localData));
    tmpl = tmpl.replace(INTERPOLATE_CONDITION_REGEXP, (_, alias, condition, trueBlock, falseBlock) => processConditional(condition, trueBlock, falseBlock, localData));
    return tmpl.replace(INTERPOLATE_VARIABLE_REGEXP, (_, expr) => {
      const value = evaluateExpression(expr, localData);
      if (value === void 0) {
        return `{{${expr}}}`;
      }
      if (formatter) {
        return formatter(value);
      }
      return String(value);
    });
  };
  return processTemplate(template, data);
}

// ../../lib/plugins/dist/template.js
function interpolateObject(obj, data) {
  if (obj === null || obj === void 0) {
    return null;
  }
  if (typeof obj === "string") {
    return interpolate(obj, data);
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => interpolateObject(item, data));
  }
  if (typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, data);
    }
    return result;
  }
  return obj;
}
async function executeRequest(template, data, fetchImpl = fetch) {
  const urlRaw = interpolate(template.url, data, encodeURIComponent);
  const url = new URL(urlRaw);
  if (template.query) {
    for (const [key, value] of Object.entries(template.query)) {
      url.searchParams.append(key, interpolate(value, data));
    }
  }
  const method = template.method;
  const headers = Object.fromEntries(Object.entries(template.headers || {}).map(([key, value]) => {
    return [key, interpolate(value, data)];
  }));
  for (const key of Object.keys(headers)) {
    if (headers[key] === null) {
      delete headers[key];
    }
  }
  let body = null;
  if (template.body) {
    if (template.body.type === "json") {
      body = JSON.stringify(interpolateObject(template.body.content, data));
    } else if (template.body.type === "form") {
      body = new URLSearchParams();
      for (const [key, value] of Object.entries(template.body.content)) {
        body.append(key, interpolate(value, data));
      }
    } else {
      body = interpolate(template.body.content, data);
    }
  }
  const response = await fetchImpl(url, {
    method,
    headers,
    body
  });
  const renderOutput = async (type, temple, response2) => {
    switch (type) {
      case "text":
        return interpolate(temple, await response2.text());
      case "blob":
        throw new Error("Invalid output type");
      case "json":
      default:
        return interpolate(temple, await response2.json());
    }
  };
  if (!response.ok) {
    const content2 = await renderOutput(template.response?.error?.input_type, template.response.error?.output, response);
    return {
      type: template.response.error.output_type,
      content: content2
    };
  }
  if (template.response.content.input_type === "blob") {
    if (template.response.content.output_type !== "image") {
      throw new Error("Invalid output type");
    }
    return {
      type: "image",
      content: await response.blob()
    };
  }
  const content = await renderOutput(template.response.content?.input_type, template.response.content?.output, response);
  return {
    type: template.response.content.output_type,
    content
  };
}
function formatInput(input, type) {
  if (type === "json") {
    return JSON.parse(input);
  } else if (type === "space-separated") {
    return input.trim().split(" ").filter(Boolean);
  } else if (type === "comma-separated") {
    return input.split(",").map((item) => item.trim()).filter(Boolean);
  } else {
    return input;
  }
}

// ../../lib/core/dist/bot/command/auth.js
async function loadChatRoleWithContext(chatId, speakerId, context) {
  const { groupAdminsKey } = context.SHARE_CONTEXT;
  if (!groupAdminsKey) {
    return null;
  }
  let groupAdmin = null;
  try {
    groupAdmin = JSON.parse(await ENV.DATABASE.get(groupAdminsKey));
  } catch (e) {
    console.error(e);
  }
  if (groupAdmin === null || !Array.isArray(groupAdmin) || groupAdmin.length === 0) {
    const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
    const result = await api.getChatAdministratorsWithReturns({ chat_id: chatId });
    if (result == null) {
      return null;
    }
    groupAdmin = result.result;
    await ENV.DATABASE.put(groupAdminsKey, JSON.stringify(groupAdmin), { expiration: Date.now() / 1e3 + 120 });
  }
  for (let i = 0; i < groupAdmin.length; i++) {
    const user = groupAdmin[i];
    if (`${user.user?.id}` === `${speakerId}`) {
      return user.status;
    }
  }
  return "member";
}

// ../../lib/core/dist/bot/command/env-shortcut.js
function parseSetEnv(arg) {
  const index = arg.indexOf("=");
  if (index <= 0) {
    throw new Error("Format: /setenv KEY=VALUE");
  }
  const key = arg.slice(0, index).trim();
  const value = arg.slice(index + 1);
  return { patch: patchFromPath(key, value), summary: `${key}=${value}` };
}
function parseSetEnvs(arg) {
  let data;
  try {
    data = JSON.parse(arg);
  } catch {
    throw new Error('Format: /setenvs {"KEY":"VALUE"}');
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error('Format: /setenvs {"KEY":"VALUE"}');
  }
  return { patch: data, summary: JSON.stringify(data) };
}
function parseDelEnv(arg) {
  const key = arg.trim();
  const parts = key.split(".");
  if (parts[0] === "settings" && parts.length === 2 && parts[1] in DEFAULT_SETTINGS) {
    const defaults = DEFAULT_SETTINGS;
    return {
      patch: { settings: { [parts[1]]: defaults[parts[1]] } },
      summary: `reset ${key}`
    };
  }
  if (key === "defaultChatProvider" || key === "defaultImageProvider") {
    return { patch: { [key]: null }, summary: `reset ${key}` };
  }
  throw new Error(`Unsupported key: ${key}`);
}
function isConfigShortcutValue(value) {
  const text = value.trim();
  return text.startsWith("/setenv") || text.startsWith("/delenv") || text.startsWith("{");
}
function parseConfigShortcut(value) {
  const text = value.trim();
  if (text.startsWith("/setenvs")) {
    return parseSetEnvs(text.slice("/setenvs".length).trim());
  }
  if (text.startsWith("/setenv")) {
    return parseSetEnv(text.slice("/setenv".length).trim());
  }
  if (text.startsWith("/delenv")) {
    return parseDelEnv(text.slice("/delenv".length).trim());
  }
  if (text.startsWith("{")) {
    return parseSetEnvs(text);
  }
  return null;
}
function applyConfigShortcut(current, shortcut) {
  return mergeConfigPatch(current, shortcut.patch);
}

// ../../lib/core/dist/bot/command/menu-commands.js
var MENU_COMMANDS = ["/new", "/redo", "/img", "/admin", "/models", "/help"];

// ../../lib/core/dist/bot/handler/handlers.js
var SERVICE_MESSAGE_FIELDS = [
  "new_chat_members",
  "left_chat_member",
  "new_chat_title",
  "new_chat_photo",
  "delete_chat_photo",
  "group_chat_created",
  "supergroup_chat_created",
  "channel_chat_created",
  "message_auto_delete_timer_changed",
  "migrate_to_chat_id",
  "migrate_from_chat_id",
  "pinned_message",
  "connected_website",
  "write_access_allowed",
  "passport_data",
  "proximity_alert_triggered",
  "boost_added",
  "chat_background_set",
  "successful_payment",
  "refunded_payment",
  "users_shared",
  "chat_shared",
  "gift",
  "unique_gift",
  "gift_upgrade_sent",
  "forum_topic_created",
  "forum_topic_edited",
  "forum_topic_closed",
  "forum_topic_reopened",
  "general_forum_topic_hidden",
  "general_forum_topic_unhidden",
  "giveaway",
  "giveaway_created",
  "giveaway_winners",
  "giveaway_completed",
  "video_chat_scheduled",
  "video_chat_started",
  "video_chat_ended",
  "video_chat_participants_invited",
  "web_app_data"
];
function isServiceMessage(message) {
  const record = message;
  return SERVICE_MESSAGE_FIELDS.some((field) => record[field] !== void 0);
}
var ServiceMessageFilter = class {
  handle = async (update, _context) => {
    if (update.message && isServiceMessage(update.message)) {
      throw new Error("Ignore service message");
    }
    return null;
  };
};
var EnvChecker = class {
  handle = async (update, context) => {
    if (!ENV.DATABASE) {
      return MessageSender.fromUpdate(context.SHARE_CONTEXT.botToken, update).sendPlainText("DATABASE Not Set");
    }
    return null;
  };
};
var AccessFilter = class {
  handle = async (update, context) => {
    const settings = ENV.CONFIG.settings;
    if (settings.allowAllUsers) {
      return null;
    }
    const sender = MessageSender.fromUpdate(context.SHARE_CONTEXT.botToken, update);
    let chatType = "";
    let chatID = 0;
    let userID = 0;
    if (update.message) {
      chatType = update.message.chat.type;
      chatID = update.message.chat.id;
      userID = update.message.from?.id || 0;
    } else if (update.callback_query?.message) {
      chatType = update.callback_query.message.chat.type;
      chatID = update.callback_query.message.chat.id;
      userID = update.callback_query.from.id;
    }
    if (!chatType || !chatID) {
      throw new Error("Invalid chat type or chat id");
    }
    const text = `You are not in the white list, please contact the administrator to add you to the white list. Your chat_id: ${chatID}`;
    const allowedUsers = /* @__PURE__ */ new Set([...settings.allowedUserIds, ...ENV.ADMIN_ID ? [ENV.ADMIN_ID] : []]);
    if (chatType === "private") {
      if (allowedUsers.has(`${userID}`) || allowedUsers.has(`${chatID}`)) {
        return null;
      }
      return sender.sendPlainText(text);
    }
    if (isGroupChat(chatType)) {
      if (!settings.groupChatBotEnable) {
        throw new Error("Not support");
      }
      if (!settings.allowedGroupIds.includes(`${chatID}`)) {
        return sender.sendPlainText(text);
      }
      return null;
    }
    return sender.sendPlainText(`Not support chat type: ${chatType}`);
  };
};
var SaveLastMessage = class {
  handle = async (message, context) => {
    if (!ENV.CONFIG.settings.debugMode) {
      return null;
    }
    const lastMessageKey = `last_message:${context.SHARE_CONTEXT.chatHistoryKey}`;
    await ENV.DATABASE.put(lastMessageKey, JSON.stringify(message), { expirationTtl: 3600 });
    return null;
  };
};
var CallbackQueryHandler = class {
  handle = async (update, context) => {
    const cb = update.callback_query;
    if (!cb) {
      return null;
    }
    const token = context.SHARE_CONTEXT.botToken;
    const api = createTelegramBotAPI(token);
    const answer = (text) => api.answerCallbackQuery({ callback_query_id: cb.id, text: text || void 0 }).then((r) => r.json()).catch(() => void 0);
    const ok = () => new Response("OK", { status: 200 });
    try {
      const parts = (cb.data || "").split(":");
      if (!["m", "mp", "im", "ip", "ml", "il"].includes(parts[0])) {
        await answer();
        return ok();
      }
      const kind = ["m", "mp", "ml"].includes(parts[0]) ? "chat" : "image";
      if (cb.message && isGroupChat(cb.message.chat.type)) {
        const role = await loadChatRoleWithContext(cb.message.chat.id, cb.from.id, context);
        if (!role || !["administrator", "creator"].includes(role)) {
          await answer("No permission");
          return ok();
        }
      }
      const providers = kind === "image" ? ENV.CONFIG.imageProviders : ENV.CONFIG.chatProviders;
      const edit = (text, keyboard) => cb.message ? api.editMessageText({
        chat_id: cb.message.chat.id,
        message_id: cb.message.message_id,
        text,
        reply_markup: keyboard
      }).then((r) => r.json()).catch(() => void 0) : Promise.resolve(void 0);
      if (parts[0] === "mp" || parts[0] === "ip") {
        const agent = kind === "image" ? loadImageGen(ENV.CONFIG) : loadChatLLM(ENV.CONFIG);
        await edit(`${agentSummary(agent)}
${ENV.I18N.callback_query.select_provider}`, providerKeyboard(kind, Number(parts[1]) || 0, currentProvider(kind)?.id ?? null));
        return ok();
      }
      const providerIdx = Number(parts[1]);
      const provider = providers[providerIdx];
      if (!provider) {
        await answer("Model list changed, send the command again");
        return ok();
      }
      if (parts[0] === "ml" || parts[0] === "il") {
        const entry = enabledProviders(kind).find((p) => p.index === providerIdx);
        if (!entry) {
          await answer("No models for this provider");
          return ok();
        }
        await edit(`${entry.label}
${ENV.I18N.callback_query.select_model}`, modelKeyboard(kind, providerIdx, entry.model, entry.models, Number(parts[2]) || 0));
        return ok();
      }
      const modelIdx = Number(parts[2]);
      const model = provider.models[modelIdx];
      if (!model) {
        await answer("Model list changed, send the command again");
        return ok();
      }
      const next = structuredClone(ENV.CONFIG);
      const nextProvider = (kind === "image" ? next.imageProviders : next.chatProviders)[providerIdx] ?? provider;
      nextProvider.model = model;
      if (kind === "image") {
        next.defaultImageProvider = nextProvider.id;
      } else {
        next.defaultChatProvider = nextProvider.id;
      }
      ENV.CONFIG = await ENV.getConfigStore().save(next);
      await answer(model);
      await edit(`${ENV.I18N.callback_query.change_model} ${provider.label} / ${model}`, modelKeyboard(kind, providerIdx, model, provider.models, Math.floor(modelIdx / MODEL_PAGE_SIZE)));
    } catch (e) {
      console.error("callback query error:", e);
      await answer(`ERROR: ${e.message}`).catch(() => void 0);
    }
    return new Response("OK", { status: 200 });
  };
};
var PROVIDER_PAGE_SIZE = 4;
var MODEL_PAGE_SIZE = 6;
function agentSummary(agent) {
  return agent ? `${agent.label} | ${agent.model}` : "Nan";
}
function enabledProviders(kind) {
  const providers = kind === "image" ? ENV.CONFIG.imageProviders : ENV.CONFIG.chatProviders;
  const entries = [];
  providers.forEach((p, index) => {
    if (p.enabled && p.models.length > 0) {
      entries.push({ index, id: p.id, label: p.label, model: p.model, models: p.models });
    }
  });
  return entries;
}
function currentProvider(kind) {
  const providers = enabledProviders(kind);
  const defaultId = kind === "image" ? ENV.CONFIG.defaultImageProvider : ENV.CONFIG.defaultChatProvider;
  return providers.find((p) => p.id === defaultId) ?? providers[0] ?? null;
}
function providerPage(kind, providerIdx) {
  const pos = enabledProviders(kind).findIndex((p) => p.index === providerIdx);
  return pos < 0 ? 0 : Math.floor(pos / PROVIDER_PAGE_SIZE);
}
function clampPage(page, total, pageSize) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safe = Number.isFinite(page) ? Math.min(Math.max(0, Math.trunc(page)), totalPages - 1) : 0;
  return { page: safe, totalPages };
}
function pageRow(page, totalPages, data) {
  if (totalPages <= 1) {
    return [];
  }
  const row = [];
  if (page > 0) {
    row.push({ text: "\u2B05\uFE0F", callback_data: data(page - 1) });
  }
  row.push({ text: `${page + 1}/${totalPages}`, callback_data: "page" });
  if (page < totalPages - 1) {
    row.push({ text: "\u27A1\uFE0F", callback_data: data(page + 1) });
  }
  return [row];
}
function providerKeyboard(kind, page, currentProviderId) {
  const providers = enabledProviders(kind);
  const { page: safePage, totalPages } = clampPage(page, providers.length, PROVIDER_PAGE_SIZE);
  const providerPrefix = kind === "image" ? "il" : "ml";
  const listPrefix = kind === "image" ? "ip" : "mp";
  const start = safePage * PROVIDER_PAGE_SIZE;
  const inline_keyboard = providers.slice(start, start + PROVIDER_PAGE_SIZE).map((p) => [
    {
      text: p.id === currentProviderId ? `\u2713 ${p.label}` : p.label,
      callback_data: `${providerPrefix}:${p.index}:0`
    }
  ]);
  inline_keyboard.push(...pageRow(safePage, totalPages, (p) => `${listPrefix}:${p}`));
  return { inline_keyboard };
}
function modelKeyboard(kind, providerIdx, current, models, page = 0) {
  const prefix = kind === "image" ? "im" : "m";
  const listPrefix = kind === "image" ? "il" : "ml";
  const { page: safePage, totalPages } = clampPage(page, models.length, MODEL_PAGE_SIZE);
  const start = safePage * MODEL_PAGE_SIZE;
  const inline_keyboard = models.slice(start, start + MODEL_PAGE_SIZE).map((m, i) => [
    {
      text: m === current ? `\u2713 ${m}` : m,
      callback_data: `${prefix}:${providerIdx}:${start + i}`
    }
  ]);
  inline_keyboard.push(...pageRow(safePage, totalPages, (p) => `${listPrefix}:${providerIdx}:${p}`));
  inline_keyboard.push([
    {
      text: `\u2B05\uFE0F ${ENV.I18N.callback_query.back}`,
      callback_data: `${kind === "image" ? "ip" : "mp"}:${providerPage(kind, providerIdx)}`
    }
  ]);
  return { inline_keyboard };
}
var OldMessageFilter = class {
  handle = async (message, context) => {
    if (!ENV.CONFIG.settings.safeMode) {
      return null;
    }
    let idList = [];
    try {
      idList = JSON.parse(await ENV.DATABASE.get(context.SHARE_CONTEXT.lastMessageKey).catch(() => "[]")) || [];
    } catch (e) {
      console.error(e);
    }
    if (idList.includes(message.message_id)) {
      throw new Error("Ignore old message");
    } else {
      idList.push(message.message_id);
      if (idList.length > 100) {
        idList.shift();
      }
      await ENV.DATABASE.put(context.SHARE_CONTEXT.lastMessageKey, JSON.stringify(idList));
    }
    return null;
  };
};
var MessageFilter = class {
  handle = async (message, _context) => {
    if (message.text) {
      return null;
    }
    if (message.caption) {
      return null;
    }
    if (message.photo) {
      return null;
    }
    throw new Error("Not supported message type");
  };
};
var CommandHandler = class {
  handle = async (message, context) => {
    if (message.text || message.caption) {
      return await handleCommandMessage(message, context);
    }
    return null;
  };
};
var ChatHandler = class {
  handle = async (message, context) => {
    const params = await extractUserMessageItem(message, context);
    return chatWithMessage(message, params, context, null);
  };
};

// ../../lib/core/dist/bot/command/system.js
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
var ImgCommandHandler = class {
  command = "/img";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    const agent = loadImageGen(ENV.CONFIG);
    if (subcommand === "") {
      const text = `${ENV.I18N.command.help.img}

${agentSummary(agent)}`;
      const current = currentProvider("image");
      if (!current) {
        return sender.sendPlainText(text);
      }
      return sender.sendRawMessage({
        chat_id: message.chat.id,
        text: `${text}
${ENV.I18N.callback_query.select_provider}`,
        reply_markup: providerKeyboard("image", providerPage("image", current.index), current.id)
      });
    }
    try {
      if (!agent) {
        return sender.sendPlainText("ERROR: Image generator not found");
      }
      const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
      setTimeout(() => api.sendChatAction({
        chat_id: message.chat.id,
        action: "upload_photo"
      }).catch(console.error), 0);
      const img = await agent.generate(subcommand);
      const resp = await sender.sendPhoto(img);
      if (!resp.ok) {
        return sender.sendPlainText(`ERROR: ${resp.statusText} ${await resp.text()}`);
      }
      return resp;
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
};
var HelpCommandHandler = class {
  command = "/help";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    let helpMsg = `${ENV.I18N.command.help.summary}
`;
    for (const cmd of MENU_COMMANDS) {
      const desc = ENV.I18N.command.help[cmd.substring(1)];
      if (desc) {
        helpMsg += `${cmd}\uFF1A${desc}
`;
      }
    }
    for (const cmd of ENV.CONFIG.customCommands) {
      if (cmd.enabled && cmd.description) {
        helpMsg += `${cmd.command}\uFF1A${cmd.description}
`;
      }
    }
    for (const plugin of ENV.CONFIG.plugins) {
      if (plugin.enabled && plugin.description) {
        helpMsg += `${plugin.command}\uFF1A${plugin.description}
`;
      }
    }
    return sender.sendPlainText(helpMsg);
  };
};
var BaseNewCommandHandler = class {
  static async handle(showID, message, subcommand, context) {
    await ENV.DATABASE.delete(context.SHARE_CONTEXT.chatHistoryKey);
    const text = ENV.I18N.command.new.new_chat_start + (showID ? `(${message.chat.id})` : "");
    const params = {
      chat_id: message.chat.id,
      text
    };
    if (ENV.CONFIG.settings.showReplyButton && !isGroupChat(message.chat.type)) {
      params.reply_markup = {
        keyboard: [[{ text: "/new" }, { text: "/redo" }]],
        selective: true,
        resize_keyboard: true,
        one_time_keyboard: false
      };
    } else {
      params.reply_markup = {
        remove_keyboard: true,
        selective: true
      };
    }
    return createTelegramBotAPI(context.SHARE_CONTEXT.botToken).sendMessage(params);
  }
};
var NewCommandHandler = class extends BaseNewCommandHandler {
  command = "/new";
  scopes = ["all_private_chats", "all_group_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    return BaseNewCommandHandler.handle(false, message, subcommand, context);
  };
};
var StartCommandHandler = class extends BaseNewCommandHandler {
  command = "/start";
  handle = async (message, subcommand, context) => {
    return BaseNewCommandHandler.handle(true, message, subcommand, context);
  };
};
async function adminPanelUrl(context) {
  const base = ENV.publicBaseUrl?.replace(/\/+$/, "");
  if (base) {
    return `${base}/admin`;
  }
  try {
    const api = createTelegramBotAPI(context.SHARE_CONTEXT.botToken);
    const info = await api.getWebhookInfo().then((r) => r.json());
    const url = info?.result?.url;
    if (url?.startsWith("https://")) {
      return `${new URL(url).origin}/admin`;
    }
  } catch {
  }
  return null;
}
async function sendAdminPanel(command, message, context) {
  const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
  const url = await adminPanelUrl(context);
  if (!url) {
    return sender.sendPlainText("ERROR: admin panel url not found, bind the webhook with /init first");
  }
  const params = {
    chat_id: message.chat.id,
    text: `Open admin panel (${command})`,
    reply_markup: {
      inline_keyboard: [[{ text: "\u2699\uFE0F Settings", web_app: { url } }]]
    }
  };
  return sender.sendRawMessage(params);
}
var AdminCommandHandler = class {
  command = "/admin";
  scopes = ["all_private_chats"];
  needAuth = TELEGRAM_AUTH_CHECKER.default;
  privileged = true;
  handle = (message, subcommand, context) => {
    return sendAdminPanel(this.command, message, context);
  };
};
var VersionCommandHandler = class {
  command = "/version";
  scopes = ["all_private_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    const current = {
      ts: ENV.BUILD_TIMESTAMP,
      sha: ENV.BUILD_VERSION
    };
    try {
      const info = `https://raw.githubusercontent.com/TBXark/ChatGPT-Telegram-Workers/${ENV.CONFIG.settings.updateBranch}/dist/buildinfo.json`;
      const online = await fetch(info).then((r) => r.json());
      const timeFormat = (ts) => {
        return new Date(ts * 1e3).toLocaleString("en-US", {});
      };
      if (current.ts < online.ts) {
        const text = `New version detected: ${online.sha}(${timeFormat(online.ts)})
Current version: ${current.sha}(${timeFormat(current.ts)})`;
        return sender.sendPlainText(text);
      }
      return sender.sendPlainText(`Current version: ${current.sha}(${timeFormat(current.ts)}) is up to date`);
    } catch (e) {
      return sender.sendPlainText(`ERROR: ${e.message}`);
    }
  };
};
var SystemCommandHandler = class {
  command = "/system";
  scopes = ["all_private_chats", "all_chat_administrators"];
  needAuth = TELEGRAM_AUTH_CHECKER.default;
  privileged = true;
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    const config = ENV.CONFIG;
    const chatAgent = loadChatLLM(config);
    const imageAgent = loadImageGen(config);
    const agent = {
      chat: agentSummary(chatAgent),
      image: agentSummary(imageAgent),
      chatProviders: config.chatProviders.filter((p) => p.enabled).map((p) => p.id),
      imageProviders: config.imageProviders.filter((p) => p.enabled).map((p) => p.id)
    };
    let msg = `<strong>AGENT</strong><pre>${escapeHtml(JSON.stringify(agent, null, 2))}</pre>`;
    if (config.settings.devMode) {
      const baseUrl = config.settings.publicBaseUrl;
      msg += `

<strong>ADMIN</strong><pre>${escapeHtml(JSON.stringify({ publicBaseUrl: baseUrl || "(unset)" }, null, 2))}</pre>`;
    }
    return sender.sendRichText(msg, "HTML");
  };
};
var RedoCommandHandler = class {
  command = "/redo";
  scopes = ["all_private_chats", "all_group_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const mf = (history, message2) => {
      let nextMessage = message2;
      if (!(history && Array.isArray(history) && history.length > 0)) {
        throw new Error("History not found");
      }
      const historyCopy = structuredClone(history);
      while (true) {
        const data = historyCopy.pop();
        if (data === void 0 || data === null) {
          break;
        } else if (data.role === "user") {
          nextMessage = data;
          break;
        }
      }
      if (subcommand) {
        nextMessage = {
          role: "user",
          content: subcommand
        };
      }
      if (nextMessage === null) {
        throw new Error("Redo message not found");
      }
      return { history: historyCopy, message: nextMessage };
    };
    return chatWithMessage(message, null, context, mf);
  };
};
var ModelsCommandHandler = class {
  command = "/models";
  scopes = ["all_private_chats", "all_group_chats", "all_chat_administrators"];
  handle = async (message, subcommand, context) => {
    const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
    const current = currentProvider("chat");
    if (!current) {
      return sender.sendPlainText("ERROR: No models. Add a provider in the admin panel first.");
    }
    return sender.sendRawMessage({
      chat_id: message.chat.id,
      text: `${agentSummary(loadChatLLM(ENV.CONFIG))}
${ENV.I18N.callback_query.select_provider}`,
      reply_markup: providerKeyboard("chat", providerPage("chat", current.index), current.id)
    });
  };
};
var EchoCommandHandler = class {
  command = "/echo";
  handle = (message, subcommand, context) => {
    let msg = "<pre>";
    msg += escapeHtml(JSON.stringify({ message }, null, 2));
    msg += "</pre>";
    return MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message).sendRichText(msg, "HTML");
  };
};

// ../../lib/core/dist/bot/command/index.js
var ConfigShortcutCommandHandler = class {
  command;
  scopes = ["all_chat_administrators"];
  privileged = true;
  constructor(command) {
    this.command = command;
  }
  handle = (message, subcommand, context) => {
    return handleConfigShortcut(message, `${this.command} ${subcommand}`.trim(), context);
  };
};
var SetEnvCommandHandler = class extends ConfigShortcutCommandHandler {
  constructor() {
    super("/setenv");
  }
};
var SetEnvsCommandHandler = class extends ConfigShortcutCommandHandler {
  constructor() {
    super("/setenvs");
  }
};
var DelEnvCommandHandler = class extends ConfigShortcutCommandHandler {
  constructor() {
    super("/delenv");
  }
};
var SYSTEM_COMMANDS = [
  new StartCommandHandler(),
  new NewCommandHandler(),
  new RedoCommandHandler(),
  new ImgCommandHandler(),
  new AdminCommandHandler(),
  new VersionCommandHandler(),
  new SystemCommandHandler(),
  new ModelsCommandHandler(),
  new HelpCommandHandler(),
  new SetEnvCommandHandler(),
  new SetEnvsCommandHandler(),
  new DelEnvCommandHandler()
];
async function handleSystemCommand(message, raw, command, context) {
  const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
  try {
    const chatId = message.chat.id;
    const speakerId = message.from?.id || chatId;
    const chatType = message.chat.type;
    const isPrivate = chatType === "private";
    if (command.privileged && isPrivate && (!ENV.ADMIN_ID || `${speakerId}` !== ENV.ADMIN_ID)) {
      return sender.sendPlainText("ERROR: Permission denied");
    }
    if (command.needAuth) {
      const roleList = command.needAuth(chatType);
      if (roleList) {
        const chatRole = await loadChatRoleWithContext(chatId, speakerId, context);
        if (chatRole === null) {
          return sender.sendPlainText("ERROR: Get chat role failed");
        }
        if (!roleList.includes(chatRole)) {
          return sender.sendPlainText(`ERROR: Permission denied, need ${roleList.join(" or ")}`);
        }
      }
    }
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}`);
  }
  const subcommand = raw.substring(command.command.length).trim();
  try {
    return await command.handle(message, subcommand, context);
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}`);
  }
}
async function handlePluginCommand(message, command, description, raw, template, env, context) {
  const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
  try {
    const subcommand = raw.substring(command.length).trim();
    if (template.input?.required && !subcommand) {
      throw new Error("Missing required input");
    }
    const DATA = formatInput(subcommand, template.input?.type);
    const { type, content } = await executeRequest(template, {
      DATA,
      ENV: env
    });
    switch (type) {
      case "image":
        return sender.sendPhoto(content);
      case "html":
        return sender.sendRichText(content, "HTML");
      case "markdown":
        return sender.sendRichText(content, "Markdown");
      case "text":
      default:
        return sender.sendPlainText(content);
    }
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}${description ? `
${description}` : ""}`);
  }
}
async function resolveConfigShortcutRole(message, speakerId, context) {
  if (ENV.ADMIN_ID && `${speakerId}` === ENV.ADMIN_ID) {
    return "operator";
  }
  if (!isGroupChat(message.chat.type)) {
    return null;
  }
  const role = await loadChatRoleWithContext(message.chat.id, speakerId, context);
  return role === "administrator" || role === "creator" ? "group_admin" : null;
}
async function handleConfigShortcut(message, value, context) {
  const sender = MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message);
  const speakerId = message.from?.id || message.chat.id;
  let shortcut;
  try {
    shortcut = parseConfigShortcut(value);
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}`);
  }
  if (shortcut === null) {
    return sender.sendPlainText(`ERROR: Invalid config shortcut: ${value}`);
  }
  const role = await resolveConfigShortcutRole(message, speakerId, context);
  if (role === null) {
    return sender.sendPlainText("ERROR: Permission denied");
  }
  try {
    const current = await ENV.loadConfig(true);
    assertPatchAllowedFor(role, shortcut.patch, current);
    const next = applyConfigShortcut(current, shortcut);
    await ENV.getConfigStore().save(next);
    await ENV.loadConfig(true);
    return sender.sendPlainText(`Update config success: ${shortcut.summary}`);
  } catch (e) {
    return sender.sendPlainText(`ERROR: ${e.message}`);
  }
}
async function handleCommandMessage(message, context) {
  let text = (message.text || message.caption || "").trim();
  for (const custom of ENV.CONFIG.customCommands) {
    if (custom.enabled && text === custom.command) {
      if (isConfigShortcutValue(custom.value)) {
        return await handleConfigShortcut(message, custom.value, context);
      }
      text = custom.value;
      break;
    }
  }
  if (ENV.CONFIG.settings.devMode) {
    for (const cmd of [...SYSTEM_COMMANDS, new EchoCommandHandler()]) {
      if (text === cmd.command || text.startsWith(`${cmd.command} `)) {
        return await handleSystemCommand(message, text, cmd, context);
      }
    }
  }
  for (const plugin of ENV.CONFIG.plugins) {
    if (!plugin.enabled) {
      continue;
    }
    const key = plugin.command;
    if (text === key || text.startsWith(`${key} `)) {
      try {
        let template = (plugin.template || "").trim();
        if (template.startsWith("http")) {
          template = await fetch(template).then((r) => r.text());
        }
        return await handlePluginCommand(message, key, plugin.description, text, JSON.parse(template), plugin.env, context);
      } catch (e) {
        return MessageSender.fromMessage(context.SHARE_CONTEXT.botToken, message).sendPlainText(`ERROR: invalid plugin template: ${e.message}`);
      }
    }
  }
  for (const cmd of SYSTEM_COMMANDS) {
    if (text === cmd.command || text.startsWith(`${cmd.command} `)) {
      return await handleSystemCommand(message, text, cmd, context);
    }
  }
  return null;
}
function commandsBindScope() {
  const scopeCommandMap = {
    all_private_chats: [],
    all_group_chats: [],
    all_chat_administrators: []
  };
  for (const cmd of SYSTEM_COMMANDS) {
    if (!MENU_COMMANDS.includes(cmd.command)) {
      continue;
    }
    if (ENV.CONFIG.settings.hideCommandButtons.includes(cmd.command)) {
      continue;
    }
    if (cmd.scopes) {
      for (const scope of cmd.scopes) {
        if (!scopeCommandMap[scope]) {
          scopeCommandMap[scope] = [];
        }
        const desc = ENV.I18N.command.help[cmd.command.substring(1)] || "";
        if (desc) {
          scopeCommandMap[scope].push({
            command: cmd.command,
            description: desc
          });
        }
      }
    }
  }
  const extras = [
    ...ENV.CONFIG.customCommands.filter((c) => c.enabled).map((c) => ({ command: c.command, description: c.description, scope: c.scope })),
    ...ENV.CONFIG.plugins.filter((p) => p.enabled).map((p) => ({ command: p.command, description: p.description, scope: p.scope }))
  ];
  for (const config of extras) {
    if (!config.scope?.length) {
      continue;
    }
    for (const scope of config.scope) {
      if (!scopeCommandMap[scope]) {
        scopeCommandMap[scope] = [];
      }
      scopeCommandMap[scope].push({
        command: config.command,
        description: config.description || ""
      });
    }
  }
  const result = {};
  for (const scope in scopeCommandMap) {
    result[scope] = {
      commands: scopeCommandMap[scope],
      scope: {
        type: scope
      }
    };
  }
  return result;
}
function commandsDocument() {
  return SYSTEM_COMMANDS.map((command) => {
    return {
      command: command.command,
      description: ENV.I18N.command.help[command.command.substring(1)] || ""
    };
  }).filter((item) => item.description !== "" && MENU_COMMANDS.includes(item.command));
}

// ../../lib/core/dist/bot/context.js
var ShareContext = class {
  botId;
  botToken;
  botName = null;
  chatHistoryKey;
  lastMessageKey;
  groupAdminsKey;
  constructor(token, update) {
    const botId = Number.parseInt(token.split(":")[0]);
    if (!ENV.TELEGRAM_TOKEN || token !== ENV.TELEGRAM_TOKEN) {
      throw new Error("Token not allowed");
    }
    this.botToken = token;
    this.botId = botId;
    const id = update.chatID;
    if (id === void 0 || id === null) {
      throw new Error("Chat id not found");
    }
    let historyKey = `history:${id}`;
    if (botId) {
      historyKey += `:${botId}`;
    }
    switch (update.chatType) {
      case "group":
      case "supergroup":
        if (!ENV.CONFIG.settings.groupChatBotShareMode && update.fromUserID) {
          historyKey += `:${update.fromUserID}`;
        }
        this.groupAdminsKey = `group_admin:${id}`;
        break;
      default:
        break;
    }
    if (update.isForum && update.isTopicMessage && update.messageThreadID) {
      historyKey += `:${update.messageThreadID}`;
    }
    this.chatHistoryKey = historyKey;
    this.lastMessageKey = `last_message_id:${historyKey}`;
  }
};
var WorkerContext = class _WorkerContext {
  SHARE_CONTEXT;
  constructor(SHARE_CONTEXT) {
    this.SHARE_CONTEXT = SHARE_CONTEXT;
  }
  static from(token, update) {
    const context = new UpdateContext(update);
    const SHARE_CONTEXT = new ShareContext(token, context);
    return new _WorkerContext(SHARE_CONTEXT);
  }
};
var UpdateContext = class {
  fromUserID;
  chatID;
  chatType;
  isForum;
  isTopicMessage;
  messageThreadID;
  constructor(update) {
    if (update.message) {
      this.fromUserID = update.message.from?.id;
      this.chatID = update.message.chat.id;
      this.chatType = update.message.chat.type;
      this.isForum = update.message.chat.is_forum;
      this.isTopicMessage = update.message.is_topic_message;
      this.messageThreadID = update.message.message_thread_id;
    } else if (update.callback_query) {
      this.fromUserID = update.callback_query.from.id;
      this.chatID = update.callback_query.message?.chat.id;
      this.chatType = update.callback_query.message?.chat.type;
      this.isForum = update.callback_query.message?.chat.is_forum;
    } else {
      console.error("Unknown update type");
    }
  }
};

// ../../lib/core/dist/bot/handler/group.js
function checkMention(content, entities, botName, botId) {
  let isMention = false;
  for (const entity of entities) {
    const entityStr = content.slice(entity.offset, entity.offset + entity.length);
    switch (entity.type) {
      case "mention":
        if (entityStr === `@${botName}`) {
          isMention = true;
          content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
        }
        break;
      case "text_mention":
        if (`${entity.user?.id}` === `${botId}`) {
          isMention = true;
          content = content.slice(0, entity.offset) + content.slice(entity.offset + entity.length);
        }
        break;
      case "bot_command":
        if (entityStr.endsWith(`@${botName}`)) {
          isMention = true;
          const newEntityStr = entityStr.replace(`@${botName}`, "");
          content = content.slice(0, entity.offset) + newEntityStr + content.slice(entity.offset + entity.length);
        }
        break;
      default:
        break;
    }
  }
  return {
    isMention,
    content
  };
}
var GroupMention = class {
  handle = async (message, context) => {
    if (!isGroupChat(message.chat.type)) {
      return null;
    }
    const replyMe = `${message.reply_to_message?.from?.id}` === `${context.SHARE_CONTEXT.botId}`;
    if (replyMe) {
      return null;
    }
    let botName = context.SHARE_CONTEXT.botName;
    if (!botName) {
      const res = await createTelegramBotAPI(context.SHARE_CONTEXT.botToken).getMeWithReturns();
      botName = res.result.username || null;
      context.SHARE_CONTEXT.botName = botName;
    }
    if (!botName) {
      throw new Error("Not set bot name");
    }
    let isMention = false;
    if (message.text && message.entities) {
      const res = checkMention(message.text, message.entities, botName, context.SHARE_CONTEXT.botId);
      isMention = res.isMention;
      message.text = res.content.trim();
    }
    if (message.caption && message.caption_entities) {
      const res = checkMention(message.caption, message.caption_entities, botName, context.SHARE_CONTEXT.botId);
      isMention = res.isMention || isMention;
      message.caption = res.content.trim();
    }
    if (!isMention) {
      throw new Error("Not mention");
    }
    return null;
  };
};

// ../../lib/core/dist/bot/handler/index.js
var SHARE_HANDLER = [
  new ServiceMessageFilter(),
  new EnvChecker(),
  new AccessFilter(),
  new CallbackQueryHandler(),
  new Update2MessageHandler([
    new MessageFilter(),
    new GroupMention(),
    new OldMessageFilter(),
    new SaveLastMessage(),
    new CommandHandler(),
    new ChatHandler()
  ])
];
async function handleUpdate(token, update) {
  await ENV.loadConfig();
  configureTelegram({
    apiDomain: ENV.CONFIG.settings.telegramApiDomain,
    defaultParseMode: ENV.CONFIG.settings.defaultParseMode,
    renderMessage: ENV.CUSTOM_MESSAGE_RENDER
  });
  const context = WorkerContext.from(token, update);
  for (const handler of SHARE_HANDLER) {
    try {
      const result = await handler.handle(update, context);
      if (result) {
        return result;
      }
    } catch (e) {
      return new Response(JSON.stringify({
        message: e.message,
        stack: e.stack
      }), { status: 500 });
    }
  }
  return null;
}

// ../../lib/core/dist/app.js
var DOCS_URL = "https://github.com/TBXark/ChatGPT-Telegram-Workers/tree/master/doc";
var REPO_URL = "https://github.com/TBXark/ChatGPT-Telegram-Workers";
var ISSUES_URL = "https://github.com/TBXark/ChatGPT-Telegram-Workers/issues";
var RPC_PATH = "/rpc";
var PAGE_PATHS = /* @__PURE__ */ new Set(["/", "/help", "/init", "/admin", "/interpolate"]);
function errorToString(e) {
  return JSON.stringify({ message: e.message, stack: e.stack });
}
function makeResponse200(resp) {
  if (resp === null) {
    return new Response("NOT HANDLED", { status: 200 });
  }
  if (resp.status === 200) {
    return resp;
  }
  const headers = new Headers(resp.headers);
  headers.set("Original-Status", `${resp.status}`);
  return new Response(resp.body, { status: 200, headers });
}
function html(body) {
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store, must-revalidate" }
  });
}
async function bindWebhook(domain) {
  const token = ENV.TELEGRAM_TOKEN;
  if (!token) {
    return { ok: false, message: "TELEGRAM_TOKEN is not set" };
  }
  const api = createTelegramBotAPI(token);
  const hookMode = ENV.API_GUARD ? "safehook" : "webhook";
  const envBase = ENV.PUBLIC_BASE_URL;
  const kvBase = ENV.CONFIG.settings.publicBaseUrl?.replace(/\/+$/, "");
  const base = envBase || kvBase || `https://${domain}`;
  if (!envBase && !kvBase) {
    try {
      const config = { ...ENV.CONFIG, settings: { ...ENV.CONFIG.settings, publicBaseUrl: base } };
      ENV.CONFIG = await ENV.getConfigStore().save(config);
      console.log(`publicBaseUrl saved to KV: ${base}`);
    } catch (e) {
      console.error("save publicBaseUrl to KV failed:", errorToString(e));
    }
  }
  const url = `${base}/telegram/${token.trim()}/${hookMode}`;
  const result = {
    webhook: await api.setWebhook({
      url,
      ...ENV.TELEGRAM_SECRET_TOKEN ? { secret_token: ENV.TELEGRAM_SECRET_TOKEN } : {}
    }).then((res) => res.json()).catch((e) => errorToString(e)),
    commands: {}
  };
  for (const [scope, data] of Object.entries(commandsBindScope())) {
    result.commands[scope] = await api.setMyCommands(data).then((res) => res.json()).catch((e) => errorToString(e));
  }
  result.menuButton = await api.setChatMenuButton({
    menu_button: {
      type: "web_app",
      text: "Settings",
      web_app: { url: `${base}/admin` }
    }
  }).then((res) => res.json()).catch((e) => errorToString(e));
  return result;
}
async function bindWebHook(domain) {
  const tokenMissing = !ENV.TELEGRAM_TOKEN;
  const result = await bindWebhook(domain);
  const ok = !!result?.webhook?.ok;
  return {
    domain,
    tokenMissing,
    outcome: tokenMissing ? "no-token" : ok ? "ok" : "error",
    result
  };
}
async function telegramWebhook(request, token) {
  try {
    if (ENV.TELEGRAM_SECRET_TOKEN) {
      const provided = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
      if (provided !== ENV.TELEGRAM_SECRET_TOKEN) {
        return new Response("Forbidden", { status: 403 });
      }
    }
    const body = await request.json();
    return makeResponse200(await handleUpdate(token, body));
  } catch (e) {
    console.error(e);
    return new Response(errorToString(e), { status: 200 });
  }
}
async function telegramSafeHook(request, token) {
  try {
    if (ENV.API_GUARD === void 0 || ENV.API_GUARD === null) {
      return telegramWebhook(request, token);
    }
    console.log("API_GUARD is enabled");
    const url = new URL(request.url);
    url.pathname = url.pathname.replace("/safehook", "/webhook");
    const newRequest = new Request(url, request);
    return makeResponse200(await ENV.API_GUARD.fetch(newRequest));
  } catch (e) {
    console.error(e);
    return new Response(errorToString(e), { status: 200 });
  }
}
function pageInfo(domain) {
  const base = ENV.publicBaseUrl?.replace(/\/+$/, "");
  return {
    domain,
    version: ENV.BUILD_VERSION,
    timestamp: ENV.BUILD_TIMESTAMP,
    adminUrl: base ? `${base}/admin` : "/admin",
    initUrl: "/init",
    interpolateUrl: base ? `${base}/interpolate` : "/interpolate",
    hasToken: !!ENV.TELEGRAM_TOKEN,
    commands: commandsDocument(),
    docsUrl: DOCS_URL,
    repoUrl: REPO_URL,
    issuesUrl: ISSUES_URL
  };
}
function matchTelegramHook(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length !== 3 || parts[0] !== "telegram") {
    return null;
  }
  if (parts[2] !== "webhook" && parts[2] !== "safehook") {
    return null;
  }
  return { token: decodeURIComponent(parts[1]), safe: parts[2] === "safehook" };
}
function createApp(options = {}) {
  const pageHtml = options.adminHtml || PAGE_HTML;
  const rpcMethods = {
    "pages.info": (_params, ctx) => pageInfo(new URL(ctx.request.url).host),
    "init.bind": async (_params, ctx) => {
      await requireAuth(ctx.request);
      return bindWebHook(new URL(ctx.request.url).host);
    },
    ...createAdminMethods()
  };
  const rpc = createRpcHandler(rpcMethods);
  async function setup(env) {
    await options.onRequest?.(env);
    await ENV.loadConfig();
    configureTelegram({
      apiDomain: ENV.CONFIG.settings.telegramApiDomain,
      defaultParseMode: ENV.CONFIG.settings.defaultParseMode,
      renderMessage: ENV.CUSTOM_MESSAGE_RENDER
    });
  }
  return {
    async fetch(request, env) {
      await setup(env);
      const { pathname } = new URL(request.url);
      if (request.method === "GET") {
        if (PAGE_PATHS.has(pathname.replace(/\/+$/, "") || "/")) {
          return html(pageHtml);
        }
      }
      if (request.method === "POST") {
        if (pathname === RPC_PATH) {
          return rpc(request, env);
        }
        const hook = matchTelegramHook(pathname);
        if (hook) {
          return hook.safe ? telegramSafeHook(request, hook.token) : telegramWebhook(request, hook.token);
        }
      }
      return new Response("Not Found", { status: 404 });
    }
  };
}

// src/index.ts
var app = createApp({
  onRequest: (env) => {
    ENV.merge(env ?? {});
  }
});
var index_default = app;
export {
  index_default as default
};
//# sourceMappingURL=index.js.map
