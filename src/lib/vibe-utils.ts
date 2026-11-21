export const VIBE_TAGS: Record<string, string[]> = {
  'classic-americana': ['denim', 'white', 'heritage', 'cotton', 'flannel', 'classic', 'workwear'],
  'coastal-summer': ['breezy', 'linen', 'bright', 'beach', 'swim', 'light', 'summer'],
  'urban-edge': ['streetwear', 'bold', 'dark', 'modern', 'graphic', 'oversized', 'urban'],
  'vintage-retro': ['70s', '80s', 'pattern', 'nostalgic', 'vibrant', 'retro', 'vintage']
};

export const FIT_TAGS: Record<string, string[]> = {
  'tailored': ['slim', 'fitted', 'tailored', 'snug'],
  'standard': ['classic', 'regular', 'standard'],
  'oversized': ['oversized', 'relaxed', 'loose', 'baggy', 'heavyweight']
};

export const GOAL_TAGS: Record<string, string[]> = {
  'workwear': ['workwear', 'polo', 'button down', 'classic'],
  'weekend': ['casual', 'hoodie', 'sweatshirt', 'tee', 'loungewear'],
  'active': ['yoga', 'active', 'sports bra', 'leggings', 'performance', 'tank'],
  'going-out': ['dress', 'graphic', 'statement', 'swim']
};

export interface PersonalizedPreferences {
  vibe?: string;
  fit?: string;
  goal?: string;
}

export function calculateVibeMatch(preferences: string | PersonalizedPreferences, productTags: string[], productTitle?: string): number {
  let vibe = typeof preferences === 'string' ? preferences : preferences.vibe;
  let fit = typeof preferences === 'string' ? undefined : preferences.fit;
  let goal = typeof preferences === 'string' ? undefined : preferences.goal;

  const targetTags: string[] = [];
  
  if (vibe && VIBE_TAGS[vibe]) {
    targetTags.push(...VIBE_TAGS[vibe]);
  }
  if (fit && FIT_TAGS[fit]) {
    targetTags.push(...FIT_TAGS[fit]);
  }
  if (goal && GOAL_TAGS[goal]) {
    targetTags.push(...GOAL_TAGS[goal]);
  }

  if (targetTags.length === 0) return 0;

  // Combine tags and title for searching
  const searchableText = [...productTags, productTitle || ''].join(' ').toLowerCase();

  const matches = targetTags.filter(targetTag => 
    searchableText.includes(targetTag.toLowerCase())
  );

  return Math.round((matches.length / targetTags.length) * 100);
}
