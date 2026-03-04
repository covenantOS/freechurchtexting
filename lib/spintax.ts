/**
 * Spintax Engine for Free Church Texting
 *
 * Processes spintax like {Hello|Hi|Hey} and randomly picks one option.
 * MUST NOT process merge tags like {first_name} - these use underscores and lowercase.
 */

/**
 * Processes spintax in the given text, replacing {option1|option2|option3} patterns
 * with a randomly selected option. Merge tags like {first_name} are left untouched.
 *
 * @param text - The input text potentially containing spintax
 * @returns The text with spintax resolved to random selections
 */
export function processSpintax(text: string): string {
  return text.replace(/\{([^{}]+)\}/g, (match, content: string) => {
    // Skip merge tags (single word with underscores like first_name, church_name)
    if (/^[a-z][a-z_]*$/i.test(content.trim())) return match;
    // Only process if there's a pipe character (spintax delimiter)
    if (!content.includes('|')) return match;
    const options = content.split('|');
    return options[Math.floor(Math.random() * options.length)].trim();
  });
}

/**
 * Generates multiple preview variations of a spintax message.
 * Useful for showing users what their recipients might see.
 *
 * @param text - The input text containing spintax
 * @param count - Number of variations to generate (default 5)
 * @returns Array of resolved variations
 */
export function generateVariations(text: string, count: number = 5): string[] {
  const variations: string[] = [];
  for (let i = 0; i < count; i++) {
    variations.push(processSpintax(text));
  }
  return variations;
}

/**
 * Checks whether a string contains spintax patterns (pipe-delimited options in braces).
 *
 * @param text - The input text to check
 * @returns true if spintax patterns are detected
 */
export function hasSpintax(text: string): boolean {
  return /\{[^{}]*\|[^{}]*\}/.test(text);
}
