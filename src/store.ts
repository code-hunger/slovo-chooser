import { combineReducers } from "redux";
import update from "immutability-helper";
import { NumberedWord } from "./Word";
import { CachedPositions } from "./ChunkRetriever";
import { without, trim, chain, compact, take, map } from "lodash";
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

import { ActionType, StateType, getType } from "typesafe-actions";
import * as actions from "./actions";

const emptyStrArr: string[] = [];

export type WordAction = ActionType<typeof actions>;

function textWordsReducer(words: NumberedWord[] = [], action: WordAction) {
  switch (action.type) {
    case getType(actions.setText):
      const newWords = action.payload.text.substr(0, 1000).split(/[\s—–]+/gu);
      return chain(newWords)
        .take(40)
        .compact()
        .map((word, index) => ({
          index,
          word,
          classNames: emptyStrArr
        }))
        .value();
    case getType(actions.wordClicked):
      return update(words, {
        [action.payload]: {
          classNames: (classes: ReadonlyArray<string>) =>
            classes.indexOf("unknown") > -1
              ? without(classes, "unknown")
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
        $push: [trim(action.payload.obj.word, "\"',.")]
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

    case getType(actions.removeLocalTextSource):
      return update(savedPositions, {
        $unset: [action.payload.id]
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
    case getType(actions.addLocalTextSource):
      return update(sources, {
        $push: [action.payload]
      } as any);

    case getType(actions.removeLocalTextSource):
      return without(sources, action.payload);

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
  chunks: string[];
  origin: "local";
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

export type State = StateType<typeof reducers>;
