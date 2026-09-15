<h1 align="center">
ChatGPT-Telegram-Workers
</h1>

<p align="center">
    <br> English | <a href="README_CN.md">中文</a>
</p>
<p align="center">
    <em>Deploy your own Telegram ChatGPT bot on Cloudflare Workers with ease.</em>
</p>
<p align="center">
    <a href="https://deploy.workers.cloudflare.com/?url=https://github.com/TBXark/ChatGPT-Telegram-Workers"><img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare"></a>
</p>

## About

The simplest and fastest way to deploy your own ChatGPT Telegram bot. Use Cloudflare Workers, single file, copy and paste directly, no dependencies required, no need to configure local development environment, no domain name required, serverless.

You can customize the system initialization information so that your debugged personality never disappears.

<details>
<summary>example</summary>
<img style="max-width: 600px;" alt="image" src="./doc/demo.png">
</details>

## Features

- Serverless deployment
- Multi-platform deployment support (Cloudflare Workers, Vercel, Docker[...](doc/en/DEPLOY_OTHERS.md))
- Adaptation to multiple AI service providers (OpenAI, Cloudflare AI, Cohere, Anthropic, Mistral, DeepSeek, Groq[...](doc/en/CONFIG.md))
- Web admin panel (Telegram Mini App) to manage AI providers and settings
- Custom commands (can achieve quick switching of models, switching of robot presets)
- Simple KV-based configuration
- Streaming output
- Multi-language support
- Text-to-image generation
- [Plugin System](doc/en/PLUGINS.md), customizable plugins.

## Documentation

- [Deploy in one click](https://deploy.workers.cloudflare.com/?url=https://github.com/TBXark/ChatGPT-Telegram-Workers) — Cloudflare clones the repo, creates the KV namespace, asks for your bot token and deploys.
- [Deploy Cloudflare Workers](./doc/en/DEPLOY.md)
- [Deploy Vercel, Local, Docker](./doc/en/DEPLOY_OTHERS.md)
- [Configuration and Commands](./doc/en/CONFIG.md)
- [Plugin System](./doc/en/PLUGINS.md)
- [Migrating from v1 to v2](./doc/en/MIGRATION.md)
- [Change Log](./doc/en/CHANGELOG.md)

## Related Projects

- [telegram-bot-api-types](https://github.com/TBXark/telegram-bot-api-types) Telegram Bot API SDK with 0 output after compilation, complete documentation, supports all APIs.

## Contributors

This project exists thanks to all the people who contribute. [Contribute](https://github.com/tbxark/ChatGPT-Telegram-Workers/graphs/contributors).

## License

**ChatGPT-Telegram-Workers** is released under the MIT license. [See LICENSE](LICENSE) for details.
