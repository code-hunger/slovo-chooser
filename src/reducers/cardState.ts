import { combineReducers } from "redux";
import { getType } from "typesafe-actions";

import { WordState, wordStateReducer } from "./wordState";
import { WordAction } from "../store";
import { setText } from "../actions";

export interface ContextBoundaries {
  start: number;
  length: number;
}

export interface CardState {
  readonly words: WordState;
  readonly contextBoundaries: ContextBoundaries;
  readonly isSelectingContext: boolean;
}

function isSelectingContextReducer(
  isSelectingContext: boolean = false,
  action: WordAction
): boolean {
  switch (action.type) {
    case "TOGGLE_SELECTING_CONTEXT_BOUNDARIES":
      return !isSelectingContext;
      break;
    default:
      return isSelectingContext;
  }
}

function contextBoundaryReducer(
  context: ContextBoundaries = { start: 0, length: 0 },
  action: WordAction
) {
  switch (action.type) {
    case "CONTEXT_SELECT_WORD_BOUNDARY":
      return { start: action.start, length: action.length };
    case getType(setText):
    case "SAVE_WORD":
      return { start: 0, length: 100 };
    default:
      return context;
  }
}

export const cardStateReducer = combineReducers<CardState>({
  words: wordStateReducer,
  contextBoundaries: contextBoundaryReducer,
  isSelectingContext: isSelectingContextReducer
});
