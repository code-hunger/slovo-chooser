import { createStore, combineReducers } from "redux";
import update from "immutability-helper";
import { NumberedWord } from "./Word";
import { CachedPositions } from "./ChunkRetriever";
import * as _ from "lodash";
import { loadState, persistState } from "./localStorage";
import { TextSource } from "./App/TextSourceChooser";
import { WordState, wordStateReducer } from "./reducers/wordState";
import {
  SavedWord,
  SavedChunks,
  savedChunksReducer
} from "./reducers/savedChunks";
import { CardState, cardStateReducer } from "./reducers/cardState";

export { SavedWord, SavedChunks };
export { ContextBoundaries } from "./reducers/cardState";

import { ActionType, getType } from "typesafe-actions";
import * as actions from "./actions";

const emptyStrArr: string[] = [];

export type WordAction =
  | ActionType<typeof actions>
  | { type: "TOGGLE_EDITED_UNKNOWN_WORDS"; added: number[]; removed: number[] }
  | { type: "CONTEXT_SELECT_WORD_BOUNDARY"; start: number; length: number }
  | { type: "TOGGLE_SELECTING_CONTEXT_BOUNDARIES" }
  | { type: "REMOVE_LOCAL_TEXT_SOURCE"; sourceIndex: LocalTextSource }
  | { type: "ADD_LOCAL_TEXT_SOURCE"; source: LocalTextSource };

function textWordsReducer(words: NumberedWord[] = [], action: WordAction) {
  switch (action.type) {
    case getType(actions.setText):
      let text: string = action.payload.text;
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
    case getType(actions.wordClicked):
      console.log("Word Clicked!", action.payload);
      return update(words, {
        [action.payload]: {
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

function savedWordsReducer(savedWords: string[] = [], action: WordAction) {
  switch (action.type) {
    case getType(actions.saveWord):
      return update(savedWords, {
        $push: [_.trim(action.payload.obj.word, "\"',.")]
      } as any);
    default:
      return savedWords;
  }
}

function chunkIdReducer(
  savedPositions: CachedPositions = {},
  action: WordAction
): CachedPositions {
  switch (action.type) {
    case getType(actions.setText):
      return update(savedPositions, {
        [action.payload.textSourceId]: {
          $set: action.payload.chunkId
        }
      });

    case "REMOVE_LOCAL_TEXT_SOURCE":
      return update(savedPositions, {
        $unset: [action.sourceIndex.id]
      });

    default:
      return savedPositions;
  }
}

function localTextSourcesReducer(
  sources: LocalTextSource[] = [],
  action: WordAction
) {
  switch (action.type) {
    case "ADD_LOCAL_TEXT_SOURCE":
      return update(sources, {
        $push: [action.source]
      } as any);

    case "REMOVE_LOCAL_TEXT_SOURCE":
      return _.without(sources, action.sourceIndex);

    default:
      return sources;
  }
}

function dictionaryReducer(dictionary: string = "", action: WordAction) {
  switch (action.type) {
    case getType(actions.setDictionary):
      return action.payload;
  }
  return dictionary;
}

export interface LocalTextSource extends TextSource<string> {
  text: string;
}

export interface State {
  readonly words: NumberedWord[];
  readonly dictionary: string;

  readonly savedChunks: SavedChunks;
  readonly savedWords: string[];

  readonly localTextSources: LocalTextSource[];
  readonly textSourcePositions: CachedPositions;

  readonly cardState: CardState;
}

export const reducers = combineReducers({
  words: textWordsReducer,
  dictionary: dictionaryReducer,

  savedChunks: savedChunksReducer,
  savedWords: savedWordsReducer,

  textSourcePositions: chunkIdReducer,
  localTextSources: localTextSourcesReducer,

  cardState: cardStateReducer
});

const store = createStore(reducers, loadState());

store.subscribe(
  _.throttle(
    () =>
      persistState(
        _.pick(store.getState(), [
          "savedChunks",
          "savedWords",
          "localTextSources",
          "textSourcePositions",
          "dictionary"
        ])
      ),
    2000
  )
);

export default store;
