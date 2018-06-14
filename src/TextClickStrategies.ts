import * as _ from "lodash";
import { Dispatch } from "react-redux";
import { WordAction } from "./store";
import reactbind from "react-bind-decorator";

export interface TextClickStrategy {
  onWordClick(wordId: number): void;
  onContextMenu(wordId: number): void;
}

export const UnknownWordSelector = (dispatch: Dispatch<WordAction>) => ({
  onWordClick(wordId: number) {
    dispatch({ type: "WORD_CLICKED", word: wordId });
  },
  onContextMenu(wordId: number) {
    return;
  }
});

@reactbind()
export class ContextSelector implements TextClickStrategy {
  private start = 0;
  private length: number;
  private dispatch: Dispatch<WordAction>;

  constructor(dispatch: Dispatch<WordAction>, wordCount: number) {
    this.length = wordCount;
    this.dispatch = dispatch;
  }

  onWordClick(wordId: number) {
    if (!_.isNumber(this.start)) {
      this.start = wordId;
      return;
    }

    const distanceToStart = Math.abs(this.start - wordId),
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

    this.dispatch({
      type: "CONTEXT_SELECT_WORD_BOUNDARY",
      start: this.start,
      length: this.length
    });
  }

  onContextMenu(wordId: number) {
    return;
  }
}
