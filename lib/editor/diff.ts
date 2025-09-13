import { Node } from 'prosemirror-model';
import { diff_match_patch } from 'diff-match-patch';

export enum DiffType {
  Inserted = 'inserted',
  Deleted = 'deleted',
}

export const diffEditor = (
  schema: any,
  oldDoc: any,
  newDoc: any,
): Node => {
  // В реальном приложении здесь будет вычисление различий между документами
  // и применение меток для вставок и удалений
  
  // Пока возвращаем новый документ без изменений
  return Node.fromJSON(schema, newDoc);
};