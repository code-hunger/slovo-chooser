import { WordAction } from "../store";
import { setText, saveWord, wordClicked, toggleEditedUnknownWord, toggleEditedUnknownWords } from "../actions";
import { getType } from "typesafe-actions";
import { without, isUndefined } from "lodash";

const emptyArr = [];

export interface WordState {
  marked: number[];
  editedMarked: number[];
}

function markedWordsReducer(state: number[] = emptyArr, action: WordAction) {
  switch (action.type) {
    case getType(wordClicked):
      if (state.indexOf(action.payload) > -1) return without(state, action.payload);
      return state.concat(action.payload).sort((a, b) => a - b);
    case getType(setText):
      return emptyArr;
    default:
      return state;
  }
}

function editedMarkedReducer(
  editedMarked: number[] = emptyArr,
  action: WordAction,
  marked: number[] = emptyArr
) {
  switch (action.type) {
    case getType(toggleEditedUnknownWord):
      if (editedMarked.indexOf(marked[action.payload]) > -1)
        return without(editedMarked,marked[action.payload]);
      return editedMarked.concat(marked[action.payload]).sort((a, b) => a - b);
    case getType(toggleEditedUnknownWords):
      let cleaned = without(editedMarked, ...action.payload.removed);
      let withAdded = cleaned.concat(action.payload.added);
      return withAdded.sort((a, b) => a - b);
    case getType(wordClicked):
      return without(editedMarked, action.payload);
    case getType(saveWord):
    case getType(setText):
      return emptyArr;
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
