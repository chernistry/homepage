import fs from 'fs';
import path from 'path';

const PROMPTS_DIR = path.join(process.cwd(), 'prompts');

export function loadPrompt(name: string): string {
  try {
    const promptPath = path.join(PROMPTS_DIR, `${name}.md`);
    return fs.readFileSync(promptPath, 'utf-8');
  } catch (error) {
    console.warn(`Failed to load prompt: ${name}`, error);
    return '';
  }
}

export function formatPrompt(template: string, variables: Record<string, string>): string {
  let formatted = template;
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return formatted;
}
