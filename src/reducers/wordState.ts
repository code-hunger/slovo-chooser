import { WordAction } from "../store";
import { setText, saveWord, wordClicked } from "../actions";
import { getType } from "typesafe-actions";
import { without, isUndefined } from "lodash";

const emptyNumArr: number[] = [];

export interface WordState {
  marked: number[];
  editedMarked: number[];
}

function markedWordsReducer(state: number[] = emptyNumArr, action: WordAction) {
  switch (action.type) {
    case getType(wordClicked):
      if (state.indexOf(action.payload) > -1) return without(state, action.payload);
      return state.concat(action.payload).sort((a, b) => a - b);
    case getType(setText):
      return emptyNumArr;
    default:
      return state;
  }
}

function editedMarkedReducer(
  editedMarked: number[] = emptyNumArr,
  action: WordAction,
  marked: number[] = emptyNumArr
) {
  switch (action.type) {
    case "TOGGLE_EDITED_UNKNOWN_WORD":
      if (editedMarked.indexOf(action.word) > -1)
        return without(editedMarked, action.word);
      return editedMarked.concat(action.word).sort((a, b) => a - b);
    case "TOGGLE_EDITED_UNKNOWN_WORDS":
      let cleaned = without(editedMarked, ...action.removed);
      let withAdded = cleaned.concat(action.added);
      return withAdded.sort((a, b) => a - b);
    case getType(wordClicked):
      const editedMarkedIndex = marked.indexOf(action.payload);

      if (editedMarkedIndex === -1)
        return editedMarked.map(
          word => (marked[word] >= action.payload ? word + 1 : word)
        );

      const withoutToggledWord = without(editedMarked, editedMarkedIndex);
      return withoutToggledWord.map(
        word => (word >= editedMarkedIndex ? word - 1 : word)
      );
    case getType(saveWord):
    case getType(setText):
      return emptyNumArr;
    default:
      return editedMarked;
  }
}

export function wordStateReducer(
  wordState: WordState,
  action: WordAction
): WordState {
  // Ugly function. @TODO make it beautiful.
  if (isUndefined(wordState))
    return {
      marked: markedWordsReducer(undefined, action),
      editedMarked: editedMarkedReducer(undefined, action)
    };

  return {
    marked: markedWordsReducer(wordState.marked, action),
    editedMarked: editedMarkedReducer(
      wordState.editedMarked,
      action,
      wordState.marked
    )
  };
}
