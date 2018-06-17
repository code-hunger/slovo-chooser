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
  words: NumberedWord[] = [],
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
  state: number[] = emptyNumArr,
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
  editedMarked: number[] = emptyNumArr,
  action: WordAction,
  marked: number[] = emptyNumArr
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

function contextBoundaryReducer(
  context: ContextBoundaries = { start: 0, length: 0 },
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

export interface ContextBoundaries {
  start: number;
  length: number;
}

export interface SavedWord {
  readonly word: string;
  readonly meaning: string;
  readonly context: string;
}

export interface SavedChunks {
  [textSourceId: string]: {
    [chunkId: number]: SavedWord[];
  };
}

interface WordState {
  marked: number[];
  editedMarked: number[];
}

interface CardState {
  readonly words: WordState;
  readonly contextBoundaries: ContextBoundaries;
}

export interface State {
  readonly words: NumberedWord[];

  readonly savedChunks: SavedChunks;
  readonly savedWords: string[];

  readonly textSourcePositions: CachedPositions;

  readonly cardState: CardState;
}

const reducers = combineReducers({
  words: textWordsReducer,

  savedChunks: savedChunksReducer,
  savedWords: savedWordsReducer,

  textSourcePositions: chunkIdReducer,

  cardState: combineReducers<CardState>({
    words: wordStateReducer,
    contextBoundaries: contextBoundaryReducer
  })
});

const store = createStore(reducers, loadState());

store.subscribe(
  _.throttle(
    () =>
      persistState(
        _.pick(store.getState(), [
          "savedChunks",
          "savedWords",
          "textSourcePositions"
        ])
      ),
    2000
  )
);

export default store;
