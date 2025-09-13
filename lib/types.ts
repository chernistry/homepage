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

export type CustomUIDataTypes = {
  'data-id': string;
  'data-title': string;
  'data-kind': string;
  'data-clear': never;
  'data-finish': never;
  'data-usage': any;
};