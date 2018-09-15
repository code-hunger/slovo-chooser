import { WordAction } from "../store";
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
    case "SAVE_WORD":
      return saveWord(
        savedChunks,
        action.textSourceId,
        action.chunkId,
        action.obj
      );
    case "REMOVE_LOCAL_TEXT_SOURCE":
      return update(savedChunks, {
        $unset: [action.sourceIndex.id]
      });
    default:
      return savedChunks;
  }
}
