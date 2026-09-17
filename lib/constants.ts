export const APP_NAME = 'Spill The Tea';
export const APP_DOMAIN = 'spillthetea.app';
export const MAX_MESSAGE_LENGTH = 300;
export const RATE_LIMIT_MAX = 3;
export const RATE_LIMIT_WINDOW_MINUTES = 10;
export const MAX_VOICE_DURATION_SECONDS = 10;

export const TOXIC_WORDS = [
  'kill', 'rape', 'molest', 'bomb', 'terrorist', 'suicide',
  'murder', 'attack', 'shoot', 'stab', 'behead',
];

export const MILDLY_TOXIC_WORDS = [
  'stupid', 'idiot', 'dumb', 'hate', 'ugly', 'loser',
  'trash', 'garbage', 'pathetic', 'worthless', 'disgusting',
];

export function containsToxicContent(text: string): boolean {
  const lower = text.toLowerCase();
  return TOXIC_WORDS.some((word) => lower.includes(word));
}

export function containsMildlyToxicContent(text: string): boolean {
  const lower = text.toLowerCase();
  return MILDLY_TOXIC_WORDS.some((word) => lower.includes(word));
}

export function getToxicityLevel(text: string): 'none' | 'mild' | 'severe' {
  if (containsToxicContent(text)) return 'severe';
  if (containsMildlyToxicContent(text)) return 'mild';
  return 'none';
}
