import { interpolate } from '@chatgpt-telegram-workers/plugins';
import { html } from '../shared/dom';
import { icon } from '../shared/icons';

const DEFAULT_TEMPLATE = `
<b>DNS query: {{Question[0].name}}</b>
<code>Status: {{#if TC}}TC,{{/if}}{{#if RD}}RD,{{/if}}{{#if RA}}RA,{{/if}}{{#if AD}}AD,{{/if}}{{#if CD}}CD,{{/if}}{{Status}}</code>

<b>Answer</b>{{#each answer in Answer}}
<code>{{answer.name}}, {{answer.type}}, (TTL: {{answer.TTL}}),{{answer.data}}</code>{{/each}}
`;

const DEFAULT_DATA = JSON.stringify(
    {
        Status: 0,
        TC: false,
        RD: true,
        RA: true,
        AD: false,
        CD: false,
        Question: [{ name: 'google.com', type: 1 }],
        Answer: [{ name: 'google.com', type: 1, TTL: 300, data: '172.217.24.110' }],
    },
    null,
    2,
);

/** 插值模板测试器:纯前端,直接调用 plugins 的 interpolate。桌面端三窗格工作区。 */
export class PageInterpolate extends HTMLElement {
    connectedCallback(): void {
        this.replaceChildren(
            html(`
            <div class="contents">
            <header class="navbar">
                <a class="nav-left" href="/">${icon('chevron-left')}Home</a>
                <span class="nav-title">Template Playground</span>
            </header>
            <main class="pg-grid">
                <section class="pane" id="template-area">
                    <div class="pane-head"><span>${icon('doc')}Template</span></div>
                    <textarea id="template" placeholder="Enter your template, using {{variable name}} to represent variables." spellcheck="false" aria-label="Template"></textarea>
                </section>
                <section class="pane" id="data-area">
                    <div class="pane-head"><span>${icon('terminal')}Data · JSON</span></div>
                    <textarea id="data" placeholder="Enter data in JSON format." spellcheck="false" aria-label="Data JSON"></textarea>
                </section>
                <section class="pane preview-area">
                    <div class="pane-head"><span>${icon('image')}Preview</span></div>
                    <pre id="preview" role="region" aria-label="Rendered preview"></pre>
                </section>
            </main>
          </div>
        `),
        );

        const template = this.querySelector<HTMLTextAreaElement>('#template')!;
        const data = this.querySelector<HTMLTextAreaElement>('#data')!;
        const update = () => this.updatePreview(template.value, data.value);
        template.addEventListener('input', update);
        data.addEventListener('input', update);

        template.value = DEFAULT_TEMPLATE;
        data.value = DEFAULT_DATA;
        update();
    }

    private updatePreview(template: string, data: string): void {
        const preview = this.querySelector('#preview');
        if (!preview) {
            return;
        }
        try {
            preview.innerHTML = interpolate(template, JSON.parse(data));
        } catch (e) {
            preview.replaceChildren(html(`<span class="error">${(e as Error).message}</span>`));
        }
    }
}

customElements.define('page-interpolate', PageInterpolate);
