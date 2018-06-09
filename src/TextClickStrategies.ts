import * as _ from "lodash";
import { Dispatch } from "react-redux";
import { State, WordAction } from "./store";

export interface TextClickStrategy {
  onWordClick(wordId: number, dispatch: Dispatch<WordAction>): void;
  onContextMenu(wordId: number, dispatch: Dispatch<WordAction>): void;
}

export const UnknownWordSelector = {
  onWordClick(wordId: number, dispatch: Dispatch<State>) {
    dispatch({ type: "WORD_CLICKED", word: wordId });
  },
  onContextMenu(wordId: number) {
    return;
  }
};

export const ContextSelector = {
  start: 0,
  length: 30,
  onWordClick(wordId: number, dispatch: Dispatch<State>) {
    if (!_.isNumber(this.start)) {
      this.start = wordId;
      return;
    }

    let distanceToStart = Math.abs(this.start - wordId),
      distanceToEnd = Math.abs(this.start + this.length - wordId);

    if (distanceToStart <= distanceToEnd * 0.6) {
      this.length += this.start - wordId;
      this.start = wordId;
    } else {
      if (this.start > wordId) {
        this.length = this.start - wordId;
        this.start = wordId;
      } else this.length = wordId - this.start;
    }

    if (!_.isNumber(this.start) || !_.isNumber(this.length))
      throw new Error("Start or length undefined!");

    dispatch({
      type: "CONTEXT_SELECT_WORD_BOUNDARY",
      start: this.start,
      length: this.length
    } as WordAction);
  },
  onContextMenu(wordId: number) {
    return;
  }
};
