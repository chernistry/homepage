import { Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { inputRules } from 'prosemirror-inputrules';
import { Transaction, EditorState } from 'prosemirror-state';
import type { EditorView } from 'prosemirror-view';

export const documentSchema = new Schema({
  nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
  marks: schema.spec.marks,
});

export const headingRule = (level: number) => {
  // В реальном приложении здесь будет правило для создания заголовков
  return null;
};

export const handleTransaction = ({
  transaction,
  editorRef,
  onSaveContent,
}: {
  transaction: Transaction;
  editorRef: React.MutableRefObject<EditorView | null>;
  onSaveContent: (updatedContent: string, debounce: boolean) => void;
}) => {
  if (!editorRef.current) return;

  const newState = editorRef.current.state.apply(transaction);
  editorRef.current.updateState(newState);

  // Если транзакция не помечена как "no-save", сохраняем содержимое
  if (!transaction.getMeta('no-save')) {
    const newContent = newState.doc.textContent;
    onSaveContent(newContent, true);
  }
};