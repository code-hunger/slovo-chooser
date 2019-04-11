import { Word, NumberedWordView, NumberedWord } from "..//Word";

import { connect } from "react-redux";
import { State } from "../store";
import { ContextBoundaries } from "../reducers/cardState";
import { trim } from "lodash";

function insideBoundaries(contextBoundaries: ContextBoundaries, index: number) {
  let start = contextBoundaries.start,
    end = start + contextBoundaries.length;
  return index >= start && index <= end;
}

const mapStateToTextWordProps = (
  { words, savedWords, cardState: { contextBoundaries } }: State,
  { index }: NumberedWord
): PropsFromState => ({
  word: words[index].word,
  classNames: words[index].classNames,
  insideBoundaries:
    contextBoundaries && insideBoundaries(contextBoundaries, index)
});

interface PropsFromState extends Word {
  insideBoundaries: boolean;
}

export default connect<PropsFromState, null, { index: number }, State>(
  mapStateToTextWordProps
)(NumberedWordView);
