import { getType } from "typesafe-actions";

import { WordAction } from "../store";
import { saveWord as saveWordAction } from "../actions"
import update from "immutability-helper";
import { without, isUndefined } from "lodash";

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

function saveWord(
  savedChunks: SavedChunks,
  sourceId: string,
  chunkId: number,
  obj: SavedWord
) {
  if (isUndefined(savedChunks[sourceId]))
    return update(savedChunks, {
      $merge: {
        [sourceId]: { [chunkId]: [obj] }
      }
    });

  if (isUndefined(savedChunks[sourceId][chunkId]))
    return update(savedChunks, {
      [sourceId]: {
        $merge: {
          [chunkId]: [obj]
        }
      }
    });

  return update(savedChunks, {
    [sourceId]: {
      [chunkId]: {
        $push: [obj]
      }
    }
  } as any);
}

export function savedChunksReducer(
  savedChunks: SavedChunks = {},
  action: WordAction
) {
  switch (action.type) {
    case getType(saveWordAction):
      return saveWord(
        savedChunks,
        action.payload.textSourceId,
        action.payload.chunkId,
        action.payload.obj
      );
    case "REMOVE_LOCAL_TEXT_SOURCE":
      return update(savedChunks, {
        $unset: [action.sourceIndex.id]
      });
    default:
      return savedChunks;
  }
}
