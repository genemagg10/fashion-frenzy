const PATHS: Record<string, string> = {
  sparkle:
    '<path d="M12 2l1.4 5.2L18 8.6l-4.6 1.4L12 15l-1.4-5L6 8.6l4.6-1.4L12 2z" fill="currentColor"/><path d="M18 13l.7 2.3 2.3.7-2.3.7L18 19l-.7-2.3-2.3-.7 2.3-.7L18 13z" fill="currentColor"/>',
  umbrella:
    '<path d="M12 3c-5 0-8 4.2-8 8h16c0-3.8-3-8-8-8z" fill="currentColor"/><path d="M12 11v8a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  flower:
    '<circle cx="12" cy="12" r="2.2" fill="currentColor"/><circle cx="12" cy="6.2" r="2.3" fill="currentColor"/><circle cx="12" cy="17.8" r="2.3" fill="currentColor"/><circle cx="6.2" cy="12" r="2.3" fill="currentColor"/><circle cx="17.8" cy="12" r="2.3" fill="currentColor"/>',
  music:
    '<path d="M9 17a2.5 2.5 0 1 1-2-2.45V6l10-2v9.2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="17" cy="14.5" r="2.4" fill="currentColor"/>',
  star: '<path d="M12 3l2.2 5.6L20 9.2l-4.2 3.6L17 19l-5-3.1L7 19l1.2-6.2L4 9.2l5.8-.6L12 3z" fill="currentColor"/>',
  cup: '<path d="M6 8h10v5a5 5 0 0 1-10 0V8z" fill="currentColor"/><path d="M16 9h2.2a2.2 2.2 0 0 1 0 4.4H16" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8 20h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  palette:
    '<path d="M12 4a8 8 0 1 0 0 16h1.2a1.8 1.8 0 0 0 0-3.6h-1a2 2 0 0 1-2-2 6 6 0 0 1 6-6H12z" fill="currentColor"/><circle cx="8.2" cy="10" r="1" fill="#fff"/><circle cx="12" cy="8" r="1" fill="#fff"/><circle cx="15.2" cy="10.5" r="1" fill="#fff"/>',
  book: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3H19v16H7.5A2.5 2.5 0 0 0 5 21.5V5.5z" fill="currentColor"/><path d="M5 19.2A2.5 2.5 0 0 1 7.5 17H19" fill="none" stroke="#fff" stroke-width="1.2" opacity=".7"/>',
  mic: '<rect x="9" y="3" width="6" height="10" rx="3" fill="currentColor"/><path d="M7 10a5 5 0 0 0 10 0M12 15v4M9 19h6" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  heart:
    '<path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" fill="currentColor"/>',
  coin: '<circle cx="12" cy="12" r="8" fill="currentColor"/><path d="M12 8v8M9.5 10.2c.6-.8 1.5-1.2 2.5-1.2 1.6 0 2.5.8 2.5 1.9S13.6 13 12 13s-2.6.7-2.6 1.9 1.1 1.9 2.6 1.9c1 0 1.9-.4 2.5-1.1" fill="none" stroke="#7a4e12" stroke-width="1.3" stroke-linecap="round"/>',
  mute: '<path d="M4 10h3l4-3v10l-4-3H4V10z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
  sound:
    '<path d="M4 10h3l4-3v10l-4-3H4V10z" fill="currentColor"/><path d="M16 9a4 4 0 0 1 0 6M18.5 7a7 7 0 0 1 0 10" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
  shelf:
    '<path fill="currentColor" fill-rule="evenodd" d="M3.2 7.4h17.6v4H3.2zm2.1 0h1.45v4H5.3zm3.55 0h1.45v4H8.85zm3.55 0h1.45v4h-1.45zm3.55 0h1.45v4h-1.45zM4.8 11.2h14.4V20.2c0 .7-.5 1.2-1.2 1.2H6c-.7 0-1.2-.5-1.2-1.2v-9zm2.3 2.1h3.4v2.5H7.1zm5.6 1.3h3.3V21.4h-3.3z"/>',
  back: '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  lock: '<rect x="6" y="11" width="12" height="9" rx="2" fill="currentColor"/><path d="M8.5 11V8.5a3.5 3.5 0 0 1 7 0V11" fill="none" stroke="currentColor" stroke-width="1.7"/>',
  check: '<path d="M5 12.5l4.2 4.2L19 7.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  scissors:
    '<circle cx="7" cy="7" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="17" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M9 8.5L20 18M9 15.5L20 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>',
  needle:
    '<path d="M16 3l5 5-9.5 9.5a3 3 0 0 1-4.2 0 3 3 0 0 1 0-4.2L16 3z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 6l4 4" stroke="currentColor" stroke-width="1.6"/>',
  lookbook:
    '<path fill="currentColor" fill-rule="evenodd" d="M3 6.1h8.1v13.2H3.9c-.5 0-.9-.4-.9-.9V6.1zm9.9 0H21v12.3c0 .5-.4.9-.9.9h-7.2V6.1zM15.35 8.15h2.5l-.45 1.85h.8l1.4 4.85h-6l1.4-4.85h.8z"/>',
};

export function icon(name: string, className = 'icon'): string {
  const body = PATHS[name] ?? PATHS.sparkle;
  return `<svg class="${className}" viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
}
