// Text-only organizational chat. Phones, links and image payloads are blocked
// with an explanation key. Amounts (e.g. 100000) must NOT be mistaken for a
// phone number, so the digit rules are deliberately strict.
export type ChatBlockReason = 'phone' | 'link' | 'image' | 'empty' | 'tooLong';

export interface ChatFilterResult {
  readonly allowed: boolean;
  readonly reasonKey: string | null;
  readonly reason: ChatBlockReason | null;
}

export const CHAT_MAX_LENGTH = 500;

const PHONE_PATTERNS: readonly RegExp[] = [
  /(?:\+?967|00967)[\s-]?\d{6,}/,
  /\b0?7[01378]\d{7}\b/,
  /\+?\d{9,}/,
];

const LINK_PATTERNS: readonly RegExp[] = [
  /https?:\/\//i,
  /\bwww\./i,
  /\b[a-z0-9-]{2,}\.(com|net|org|ye|io|co|me|app)\b/i,
];

const IMAGE_PATTERNS: readonly RegExp[] = [
  /data:image\//i,
  /\.(png|jpe?g|gif|webp|heic|bmp|svg)\b/i,
  /!\[[^\]]*\]\([^)]*\)/,
];

function matchesAny(text: string, patterns: readonly RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

export function filterChatMessage(raw: string): ChatFilterResult {
  const text = raw.trim();
  if (text.length === 0) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.empty', reason: 'empty' };
  }
  if (text.length > CHAT_MAX_LENGTH) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.tooLong', reason: 'tooLong' };
  }
  if (matchesAny(text, IMAGE_PATTERNS)) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.image', reason: 'image' };
  }
  if (matchesAny(text, LINK_PATTERNS)) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.link', reason: 'link' };
  }
  if (matchesAny(text, PHONE_PATTERNS)) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.phone', reason: 'phone' };
  }
  return { allowed: true, reasonKey: null, reason: null };
}
