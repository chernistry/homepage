export type Attachment = {
  url: string;
  name?: string;
  contentType?: string;
  filename?: string;
  mediaType?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  parts: Array<{
    type: 'text' | 'file' | 'reasoning' | 'tool-getWeather' | 'tool-createDocument' | 'tool-updateDocument' | 'tool-requestSuggestions';
    text?: string;
    url?: string;
    name?: string;
    mediaType?: string;
    filename?: string;
    toolCallId?: string;
    state?: string;
    input?: any;
    output?: any;
  }>;
};

export type GenerationConfig = {
  temperature?: number; // 0.0-2.0
  maxResponseCharacters?: number; // 1-10000
  frequencyPenalty?: number; // -2.0-2.0
  presencePenalty?: number; // -2.0-2.0
  topP?: number; // 0.0-1.0 - nucleus sampling
  maxTokens?: number; // maximum tokens to generate
  generationPresetName?: string;
  promptName?: string;
  systemPrompt?: string; // custom system prompt
};

export type CustomUIDataTypes = {
  'data-id': string;
  'data-title': string;
  'data-kind': string;
  'data-clear': never;
  'data-finish': never;
  'data-usage': any;
};