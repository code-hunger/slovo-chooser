import { getType } from "typesafe-actions";

import { WordAction } from "../store";
import * as actions from "../actions";
import update from "immutability-helper";
import { without, isUndefined } from "lodash";

export interface SavedWord {
  readonly word: string;
  readonly meaning: string;
  readonly context: string;
}

export interface SavedChunksInSource {
  [chunkId: number]: SavedWord[];
}

export interface SavedChunks {
  [textSourceId: string]: SavedChunksInSource;
}

function saveWord(
  savedChunksInSource: SavedChunksInSource,
  sourceId: string,
  chunkId: number,
  obj: SavedWord
) {
  if (isUndefined(savedChunksInSource))
    return {
      $merge: {
        [sourceId]: { [chunkId]: [obj] }
      }
    };

  if (isUndefined(savedChunksInSource[chunkId]))
    return {
      [sourceId]: {
        $merge: {
          [chunkId]: [obj]
        }
      }
    };

  return {
    [sourceId]: {
      [chunkId]: {
        $push: [obj]
      }
    }
  };
}

export function savedChunksReducer(
  savedChunks: SavedChunks = {},
  action: WordAction
) {
  switch (action.type) {
    case getType(actions.saveWord):
      return update(
        savedChunks,
        saveWord(
          savedChunks[action.payload.textSourceId],
          action.payload.textSourceId,
          action.payload.chunkId,
          action.payload.obj
        )
      );
    case getType(actions.removeLocalTextSource):
      return update(savedChunks, {
        $unset: [action.payload.id]
      });
    default:
      return savedChunks;
  }
}
