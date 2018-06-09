import * as React from "react";
import { WordCollector } from "./WordCollector";
import store, { State } from "./store";
import { Word, NumberedWord, NumberedWordView } from "./Word";
import { connect } from "react-redux";
import { KeyboardSelectableContainer } from "./NumberSelectableContainer";
import * as _ from "lodash";

interface Props {
  words: NumberedWord[];
  tabIndex?: number;
}

const markedWordStateToProps = (
  { wordState }: State,
  ownProps: NumberedWord
): Word => ({
  word: wordState.words[wordState.marked[ownProps.index]].word,
  classNames:
    wordState.editedMarked.indexOf(ownProps.index) > -1 ||
    wordState.savedWords.indexOf(ownProps.word) > -1
      ? ownProps.classNames.concat("fade-word")
      : ownProps.classNames
});

const MarkedWord = connect<Word, null, { index: number }>(
  markedWordStateToProps
)(NumberedWordView);

export class View extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.onWordClick = this.onWordClick.bind(this);
  }
  onWordClick(wordId: number) {
    store.dispatch({
      type: "TOGGLE_EDITED_UNKNOWN_WORD",
      word: this.props.words[wordId].index
    });
    return true;
  }
  render() {
    return this.props.words.length ? (
      <KeyboardSelectableContainer
        elementCount={this.props.words.length}
        onSelectElement={this.onWordClick}
      >
        <WordCollector
          className="unknownWordsList"
          wordType={MarkedWord}
          words={this.props.words}
          tabIndex={this.props.tabIndex}
          onWordClick={this.onWordClick}
          onWordRightClick={_.stubTrue}
        />
      </KeyboardSelectableContainer>
    ) : (
      "No marked words"
    );
  }
}
