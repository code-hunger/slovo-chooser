import { createStore, combineReducers } from "redux";
import update from "immutability-helper";
import { NumberedWord } from "./Word";
import { CachedPositions } from "./ChunkRetriever";
import * as _ from "lodash";
import { loadState, persistState } from "./localStorage";

const emptyStrArr: string[] = [];
const emptyNumArr: number[] = [];

export type WordAction =
  | { type: "SET_TEXT"; text: string; chunkId: number; textSourceId: string }
  | { type: "WORD_CLICKED"; word: number }
  | { type: "SAVE_WORD"; obj: SavedWord; chunkId: number; textSourceId: string }
  | { type: "WORD_NUMBER_SET"; number: number }
  | { type: "WORD_NUMBER_TYPED_RESET" }
  | { type: "TOGGLE_EDITED_UNKNOWN_WORD"; word: number }
  | { type: "TOGGLE_EDITED_UNKNOWN_WORDS"; added: number[]; removed: number[] }
  | { type: "CONTEXT_SELECT_WORD_BOUNDARY"; start: number; length: number };

function textWordsReducer(
  words: ReadonlyArray<NumberedWord> = [],
  action: WordAction
) {
  switch (action.type) {
    case "SET_TEXT":
      let text: string = action.text;
      console.log("set text!", words, action.text);
      return text
        .substr(0, 1000)
        .split(/[\s—–]+/gu)
        .slice(0, 40)
        .filter(w => !!w)
        .map((word, index) => ({
          index,
          word,
          classNames: emptyStrArr
        }));
    case "WORD_CLICKED":
      console.log("Word Clicked!", action.word);
      return update(words, {
        [action.word]: {
          classNames: (classes: ReadonlyArray<string>) =>
            classes.indexOf("unknown") > -1
              ? _.without(classes, "unknown")
              : classes.concat("unknown")
        }
      });
    default:
      return words;
  }
}

function markedWordsReducer(
  state: ReadonlyArray<number> = emptyNumArr,
  action: WordAction
) {
  switch (action.type) {
    case "WORD_CLICKED":
      if (state.indexOf(action.word) > -1) return _.without(state, action.word);
      return state.concat(action.word).sort((a, b) => a - b);
    case "SET_TEXT":
      return emptyNumArr;
    default:
      return state;
  }
}

function editedMarkedReducer(
  editedMarked: ReadonlyArray<number> = emptyNumArr,
  action: WordAction,
  marked: ReadonlyArray<number> = emptyNumArr
) {
  switch (action.type) {
    case "TOGGLE_EDITED_UNKNOWN_WORD":
      if (editedMarked.indexOf(action.word) > -1)
        return _.without(editedMarked, action.word);
      return editedMarked.concat(action.word).sort((a, b) => a - b);
    case "TOGGLE_EDITED_UNKNOWN_WORDS":
      let cleaned = _.without(editedMarked, ...action.removed);
      let withAdded = cleaned.concat(action.added);
      return withAdded.sort((a, b) => a - b);
    case "WORD_CLICKED":
      const editedMarkedIndex = marked.indexOf(action.word);

      if (editedMarkedIndex === -1)
        return editedMarked.map(
          word => (marked[word] >= action.word ? word + 1 : word)
        );

      const withoutToggledWord = _.without(editedMarked, editedMarkedIndex);
      return withoutToggledWord.map(
        word => (word >= editedMarkedIndex ? word - 1 : word)
      );
    case "SAVE_WORD":
    case "SET_TEXT":
      return emptyNumArr;
    default:
      return editedMarked;
  }
}

function wordNumberTypedReducer(
  currentNumberTyped: number = 0,
  action: WordAction
) {
  switch (action.type) {
    case "WORD_NUMBER_SET":
      return action.number;
    case "WORD_NUMBER_TYPED_RESET":
    case "WORD_CLICKED":
    case "SET_TEXT":
    case "SAVE_WORD":
      return 0;
    default:
      return currentNumberTyped;
  }
}

function contextBoundaryReducer(
  context: { start: number; length: number },
  action: WordAction
) {
  switch (action.type) {
    case "CONTEXT_SELECT_WORD_BOUNDARY":
      return { start: action.start, length: action.length };
    case "SET_TEXT":
    case "SAVE_WORD":
      return { start: 0, length: 100 };
    default:
      return context;
  }
}

function savedWordsReducer(savedWords: string[] = [], action: WordAction) {
  switch (action.type) {
    case "SAVE_WORD":
      return update(savedWords, {
        $push: [action.obj.word]
      });
    default:
      return savedWords;
  }
}

function chunkIdReducer(
  savedPositions: CachedPositions = {},
  action: WordAction
): CachedPositions {
  switch (action.type) {
    case "SET_TEXT":
      return update(savedPositions, {
        [action.textSourceId]: {
          $set: action.chunkId
        }
      });

    default:
      return savedPositions;
  }
}

function savedChunksReducer(savedChunks: SavedChunks = {}, action: WordAction) {
  switch (action.type) {
    case "SAVE_WORD":
      const sourceId = action.textSourceId,
        chunkId = action.chunkId;
      if (_.isUndefined(savedChunks[sourceId])) {
        savedChunks = update(savedChunks, {
          $merge: {
            [sourceId]: { [chunkId]: [] }
          }
        });
      } else if (_.isUndefined(savedChunks[sourceId][chunkId]))
        savedChunks = update(savedChunks, {
          [sourceId]: {
            $merge: {
              [chunkId]: []
            }
          }
        });
      return update(savedChunks, {
        [sourceId]: {
          [chunkId]: {
            $push: [action.obj]
          }
        }
      });
    default:
      return savedChunks;
  }
}

function wordStateReducer(wordState: WordState, action: WordAction): WordState {
  // Ugly function. @TODO make it beautiful.
  if (_.isUndefined(wordState))
    return <WordState>{
      words: textWordsReducer(undefined, action),
      marked: markedWordsReducer(undefined, action),
      editedMarked: editedMarkedReducer(undefined, action),
      savedWords: savedWordsReducer(undefined, action)
    };
  return <WordState>{
    words: textWordsReducer(wordState.words, action),
    marked: markedWordsReducer(wordState.marked, action),
    editedMarked: editedMarkedReducer(
      wordState.editedMarked,
      action,
      wordState.marked
    ),
    contextBoundaries: contextBoundaryReducer(
      wordState.contextBoundaries,
      action
    ),
    savedWords: savedWordsReducer(wordState.savedWords, action)
  };
}

export interface ContextBoundaries {
  start: number;
  length: number;
}

export interface SavedWord {
  readonly word: string;
  readonly meaning: string;
  readonly context: string;
}

export type SavedWords = SavedWord[];

export interface SavedChunks {
  [textSourceId: string]: {
    [chunkId: number]: SavedWord[];
  };
}

interface WordState {
  readonly words: NumberedWord[];
  readonly marked: number[];
  readonly editedMarked: number[];
  readonly contextBoundaries: ContextBoundaries;
  readonly savedWords: string[];
}

export interface State {
  readonly wordState: WordState;
  readonly textSourcePositions: CachedPositions;
  readonly savedChunks: SavedChunks;
}

const reducers = combineReducers({
  wordState: wordStateReducer,
  textSourcePositions: chunkIdReducer,
  savedChunks: savedChunksReducer,
  keyboardControl: combineReducers({
    wordNumberTyped: wordNumberTypedReducer
  })
});

const store = createStore(reducers, loadState());

store.subscribe(_.throttle(() => persistState(store.getState()), 2000));

export default store;
