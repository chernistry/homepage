import type { GenerationConfig } from '@/lib/types';

export const GENERATION_PRESETS = {
  default: {
    temperature: 0.7,
    maxResponseCharacters: 1200,
    frequencyPenalty: 0.1,
    generationPresetName: "vectara-summary-table-query-ext-dec-2024-gpt-4o",
    promptName: "vectara-experimental-extended-2024-07-16",
  },
  creative: {
    temperature: 1.0,
    maxResponseCharacters: 1500,
    frequencyPenalty: 0.2,
    generationPresetName: "vectara-summary-table-query-ext-dec-2024-gpt-4o",
    promptName: "vectara-experimental-extended-2024-07-16",
  },
  precise: {
    temperature: 0.3,
    maxResponseCharacters: 800,
    frequencyPenalty: 0.0,
    generationPresetName: "vectara-summary-table-query-ext-dec-2024-gpt-4o",
    promptName: "vectara-experimental-extended-2024-07-16",
  },
} as const satisfies Record<string, GenerationConfig>;

export function getGenerationConfig(preset?: keyof typeof GENERATION_PRESETS): GenerationConfig {
  return GENERATION_PRESETS[preset || 'default'];
}
