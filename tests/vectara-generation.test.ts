import { describe, it, expect } from 'vitest';
import { z } from 'zod';

const GenerationConfigSchema = z.object({
  temperature: z.number().min(0).max(2).optional(),
  maxResponseCharacters: z.number().min(1).max(10000).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
  generationPresetName: z.string().optional(),
  promptName: z.string().optional(),
}).optional();

describe('Generation Config Validation', () => {
  it('validates temperature range', () => {
    expect(() => GenerationConfigSchema.parse({ temperature: 0.7 })).not.toThrow();
    expect(() => GenerationConfigSchema.parse({ temperature: 2.5 })).toThrow();
    expect(() => GenerationConfigSchema.parse({ temperature: -0.1 })).toThrow();
  });

  it('validates max response characters', () => {
    expect(() => GenerationConfigSchema.parse({ maxResponseCharacters: 1200 })).not.toThrow();
    expect(() => GenerationConfigSchema.parse({ maxResponseCharacters: 0 })).toThrow();
    expect(() => GenerationConfigSchema.parse({ maxResponseCharacters: 15000 })).toThrow();
  });

  it('validates penalty ranges', () => {
    expect(() => GenerationConfigSchema.parse({ frequencyPenalty: 0.1 })).not.toThrow();
    expect(() => GenerationConfigSchema.parse({ presencePenalty: -1.5 })).not.toThrow();
    expect(() => GenerationConfigSchema.parse({ frequencyPenalty: 3 })).toThrow();
    expect(() => GenerationConfigSchema.parse({ presencePenalty: -3 })).toThrow();
  });
});
