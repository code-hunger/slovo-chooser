import * as _ from "lodash";
import { WordAction } from "./store";
import { setContextBoundaries, wordClicked } from "./actions";

export interface TextClickStrategy {
  onWordClick(wordId: number): WordAction | undefined;
  onContextMenu(wordId: number): WordAction | undefined;
}

export const UnknownWordSelector = {
  onWordClick: wordClicked,
  onContextMenu(wordId: number) {
    return undefined;
  }
};

export class ContextSelector implements TextClickStrategy {
  private start = 0;
  private length: number;

  constructor(wordCount: number) {
    this.length = wordCount;
  }

  onWordClick = (wordId: number) => {
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

    return setContextBoundaries(this.start, this.length);
  };

  onContextMenu = (wordId: number) => {
    return undefined;
  };
}
