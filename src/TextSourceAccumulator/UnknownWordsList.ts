import * as React from "react";
import { State, WordAction } from "../store";
import { Word, NumberedWord, NumberedWordView } from "../Word";
import { Dispatch, connect } from "react-redux";
import UnknownWordList from "../UnknownWordList";
import { trim } from "lodash";

interface PropsFromState {
  words: NumberedWord[];
  wordType: React.ComponentClass | React.StatelessComponent;
}

interface PropsFromDispatch {
  onWordClick: (id: number) => void;
}

const markedWordStateToProps = (
  { cardState: { words: { marked, editedMarked } }, words, savedWords }: State,
  ownProps: NumberedWord
): Word => ({
  word: words[marked[ownProps.index]].word,
  classNames:
    editedMarked.indexOf(ownProps.index) > -1 ||
    savedWords.indexOf(trim(ownProps.word, "\"\',.")) > -1
      ? ownProps.classNames.concat("fade-word")
      : ownProps.classNames
});

const MarkedWord = connect<Word, null, { index: number }>(
  markedWordStateToProps
)(NumberedWordView);

export default connect<
  PropsFromState,
  PropsFromDispatch,
  { tabIndex?: number },
  State
>(
  ({ cardState, words }: State) => ({
    wordType: MarkedWord,
    words: cardState.words.marked.map((wordId, i) => ({
      ...words[wordId],
      index: i
    }))
  }),
  (dispatch: Dispatch<WordAction>) => ({
    onWordClick(index: number) {
      dispatch({
        type: "TOGGLE_EDITED_UNKNOWN_WORD",
        word: index
      });
      return true;
    }
  })
)(UnknownWordList);
