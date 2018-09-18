import { SavedWord, SavedChunks } from "./reducers/savedChunks";

import { createAction } from "typesafe-actions";

export const setText = createAction(
  "SET_TEXT",
  resolve => (text: string, chunkId: number, textSourceId: string) =>
    resolve({ text, chunkId, textSourceId })
);

export const saveWord = createAction(
  "SAVE_WORD",
  resolve => (obj: SavedWord, chunkId: number, textSourceId: string) =>
    resolve({ obj, chunkId, textSourceId })
);
