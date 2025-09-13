import { Node } from 'prosemirror-model';
import { documentSchema } from './config';
import type { Decoration } from 'prosemirror-view';

export const buildDocumentFromContent = (content: string) => {
  // В реальном приложении здесь будет преобразование текста в ProseMirror документ
  return documentSchema.nodeFromJSON({
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: content,
          },
        ],
      },
    ],
  });
};

export const buildContentFromDocument = (doc: Node) => {
  // В реальном приложении здесь будет преобразование ProseMirror документа в текст
  return doc.textContent;
};

export const createDecorations = (
  suggestions: any[],
  editorRef: any,
): Decoration[] => {
  // В реальном приложении здесь будет создание декораций для подсветки предложений
  return [];
};