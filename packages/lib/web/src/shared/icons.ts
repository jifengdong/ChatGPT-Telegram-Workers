/**
 * 内联 SVG 图标(仿 SF Symbols:24 viewBox、线性描边,粗细由 CSS 控制)。
 * 统一使用 currentColor,尺寸由 CSS 的 .icon 控制。
 */
const PATHS: Record<string, string> = {
    bot: '<rect width="16" height="12" x="4" y="9" rx="3.5"/><path d="M12 9V5"/><path d="M9.5 5h5"/><path d="M2.5 13.5v3"/><path d="M21.5 13.5v3"/><path d="M8.8 13.8v1.6"/><path d="M15.2 13.8v1.6"/>',
    image: '<rect width="17" height="17" x="3.5" y="3.5" rx="3.5"/><circle cx="9" cy="9" r="1.8"/><path d="m20.5 14.5-3.3-3.3a2 2 0 0 0-2.8 0L6.5 19"/>',
    gear: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    puzzle: '<path d="M14 7V5.5A1.5 1.5 0 0 0 12.5 4h-1A1.5 1.5 0 0 0 10 5.5V7H7a2 2 0 0 0-2 2v2.6h1.4a1.6 1.6 0 0 1 0 3.2H5V19a2 2 0 0 0 2 2h2.6v-1.4a1.6 1.6 0 0 1 3.2 0V21H17a2 2 0 0 0 2-2v-3h1.4a1.6 1.6 0 0 0 0-3.2H19V9a2 2 0 0 0-2-2h-3z"/>',
    terminal: '<path d="m6 8 4 4-4 4"/><path d="M12.5 17H19"/>',
    'chevron-left': '<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>',
    'chevron-right': '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash: '<path d="M4 6.5h16"/><path d="M15.5 6.5V5a1.5 1.5 0 0 0-1.5-1.5h-4A1.5 1.5 0 0 0 8.5 5v1.5"/><path d="M18.5 6.5v12a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-12"/>',
    check: '<path d="m4.5 12.5 5 5L19.5 7"/>',
    x: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    'minus-circle': '<circle cx="12" cy="12" r="9"/><path d="M8 12h8"/>',
    refresh: '<path d="M20.5 12a8.5 8.5 0 1 1-2.49-6.01"/><path d="M20.5 3.5v4h-4"/>',
    external: '<path d="M7.5 7.5h9v9"/><path d="M7.5 16.5 16.5 7.5"/>',
    doc: '<path d="M14 2.5H7A2 2 0 0 0 5 4.5v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7.5l-5-5z"/><path d="M14 2.5v5h5"/><path d="M9 12.5h6"/><path d="M9 16h6"/>',
    warning:
        '<path d="M12 3.5 2.8 19.2a1.6 1.6 0 0 0 1.4 2.4h15.6a1.6 1.6 0 0 0 1.4-2.4L12 3.5z"/><path d="M12 10v4"/><path d="M12 17.5h.01"/>',
    'check-circle': '<circle cx="12" cy="12" r="9"/><path d="m8 12.5 2.8 2.8L16.5 9"/>',
    'x-circle': '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6"/><path d="m15 9-6 6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18z"/><path d="M3 12h18"/>',
    star: '<path d="m12 3 2.9 5.9 6.5.9-4.7 4.6 1.1 6.5-5.8-3-5.8 3 1.1-6.5L2.6 9.8l6.5-.9L12 3z"/>',
    lock: '<rect width="16" height="10.5" x="4" y="10.5" rx="3"/><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5"/>',
    logout: '<path d="M9.5 20.5H6a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2h3.5"/><path d="m15.5 16.5 4.5-4.5-4.5-4.5"/><path d="M20 12H9.5"/>',
    link: '<path d="M10 13.5a5 5 0 0 0 7.5.5l2.5-2.5a5 5 0 0 0-7-7l-1.4 1.4"/><path d="M14 10.5a5 5 0 0 0-7.5-.5L4 12.5a5 5 0 0 0 7 7l1.4-1.4"/>',
};

/** 生成内联 SVG;decorative 为 true 时对屏幕阅读器隐藏。 */
export function icon(name: keyof typeof PATHS | string, decorative = true): string {
    const path = PATHS[name] ?? '';
    const hidden = decorative ? ' aria-hidden="true" focusable="false"' : '';
    return `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${hidden}>${path}</svg>`;
}
