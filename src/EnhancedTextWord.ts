import { Word, NumberedWordView, NumberedWord, Clickable } from "./Word";

import { connect, Dispatch } from "react-redux";
import store, {
  State,
  ContextBoundaries,
  SavedChunks,
  SavedWord,
  SavedWords
} from "./store";

function insideBoundaries(contextBoundaries: ContextBoundaries, index: number) {
  let start = contextBoundaries.start,
    end = start + contextBoundaries.length;
  return index >= start && index <= end;
}

const mapStateToTextWordProps = (
  { words, savedWords, contextBoundaries }: State,
  { index }: NumberedWord
): Word => ({
  word: words[index].word,
  classNames: [
    ...words[index].classNames,
    ...(contextBoundaries && insideBoundaries(contextBoundaries, index)
      ? ["boundary"]
      : []),
    ...(savedWords.indexOf(words[index].word) > -1 ? ["fade-word"] : [])
  ]
});

export default connect<Word, null, { index: number }>(mapStateToTextWordProps)(
  NumberedWordView
);
