import { SavedWord, SavedChunks } from "./reducers/savedChunks";
import { LocalTextSource } from "./store";

import { createAction, createStandardAction } from "typesafe-actions";

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

export const setDictionary = createStandardAction("SET_DICTIONARY")<string>();

export const setContextBoundaries = createAction(
  "SET_CONTEXT_BOUNDARIES",
  resolve => (start: number, length: number) => resolve({ start, length })
);

export const wordClicked = createStandardAction("WORD_CLICKED")<number>();

export const toggleEditedUnknownWord = createStandardAction(
  "TOGGLE_EDITED_UNKNOWN_WORD"
)<number>();

export const removeLocalTextSource = createStandardAction(
  "REMOVE_LOCAL_TEXT_SOURCE"
)<LocalTextSource>();
export const addLocalTextSource = createStandardAction("ADD_LOCAL_TEXT_SOURCE")<
  LocalTextSource
>();

export const toggleSelectingContext = createStandardAction("TOGGLE_SELECTING_CONTEXT_BOUNDARIES")<void>();
