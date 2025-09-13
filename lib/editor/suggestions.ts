import { Plugin, PluginKey } from 'prosemirror-state';
import { DecorationSet } from 'prosemirror-view';
import type { Node } from 'prosemirror-model';

export const suggestionsPluginKey = new PluginKey('suggestions');

export const suggestionsPlugin = new Plugin({
  key: suggestionsPluginKey,
  state: {
    init() {
      return { decorations: [] };
    },
    apply(tr, prev) {
      const meta = tr.getMeta(suggestionsPluginKey);
      if (meta) return meta;
      return prev;
    },
  },
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      if (!pluginState) return null;
      const decorations = pluginState.decorations;
      return decorations.length > 0 ? DecorationSet.create(state.doc, decorations) : null;
    },
  },
});

export const projectWithPositions = (
  doc: Node,
  suggestions: any[],
): any[] => {
  // В реальном приложении здесь будет проекция предложений на позиции в документе
  return suggestions.map((suggestion) => ({
    ...suggestion,
    selectionStart: 0,
    selectionEnd: 0,
  }));
};