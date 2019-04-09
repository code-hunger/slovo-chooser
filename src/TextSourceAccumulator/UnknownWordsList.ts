import * as React from "react";
import { State, WordAction } from "../store";
import { Word, NumberedWord, NumberedWordView } from "../Word";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { UnknownWordList } from "shadow-cljs/project.UnknownWordList";
import { trim } from "lodash";
import { toggleEditedUnknownWord } from "../actions";

interface PropsFromState {
  words: NumberedWord[];
  wordType: React.ComponentClass | React.StatelessComponent;
}

interface PropsFromDispatch {
  onWordClick: (id: number) => void;
}

const markedWordStateToProps = (
  {
    cardState: {
      words: { marked, editedMarked }
    },
    words,
    savedWords
  }: State,
  ownProps: NumberedWord
): Word => ({
  word: words[marked[ownProps.index]].word,
  classNames:
    editedMarked.indexOf(marked[ownProps.index]) > -1 ||
    savedWords.indexOf(trim(ownProps.word, "\"',.")) > -1
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
  dispatch =>
    bindActionCreators({ onWordClick: toggleEditedUnknownWord }, dispatch)
)(UnknownWordList);
