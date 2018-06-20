import { Word, NumberedWordView, NumberedWord } from "../views/Word";

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
): Word => ({
  word: words[index].word,
  classNames: [
    ...words[index].classNames,
    ...(contextBoundaries && insideBoundaries(contextBoundaries, index)
      ? ["boundary"]
      : []),
    ...(savedWords.indexOf(trim(words[index].word, "\"\',.")) > -1 ? ["fade-word"] : [])
  ]
});

export default connect<Word, null, { index: number }>(mapStateToTextWordProps)(
  NumberedWordView
);
