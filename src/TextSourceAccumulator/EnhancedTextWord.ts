import { Word, NumberedWordView, NumberedWord } from "..//Word";

import { connect } from "react-redux";
import store, { State, ContextBoundaries } from "../store";
import { trim } from "lodash";

function insideBoundaries(contextBoundaries: ContextBoundaries, index: number) {
  let start = contextBoundaries.start,
    end = start + contextBoundaries.length;
  return index >= start && index <= end;
}

const mapStateToTextWordProps = (
  { words, savedWords, cardState: { contextBoundaries } }: State,
  { index }: NumberedWord
) => ({
  word: words[index].word,
  classNames: words[index].classNames,
  insideBoundaries: contextBoundaries && insideBoundaries(contextBoundaries, index),
});

export default connect<Word, null, { index: number }>(mapStateToTextWordProps)(
  NumberedWordView
);
