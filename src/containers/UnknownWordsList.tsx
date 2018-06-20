import * as React from "react";
import { WordCollector } from "../views/WordCollector";
import store, { State, WordAction } from "../store";
import { Word, NumberedWord, NumberedWordView } from "../views/Word";
import { Dispatch, connect } from "react-redux";
import { KeyboardSelectableContainer } from "./NumberSelectableContainer";
import * as _ from "lodash";
import { TextClickStrategy } from "../TextClickStrategies";

type Props = PropsFromState &
  PropsFromDispatch & {
    tabIndex?: number;
  };

interface PropsFromState {
  words: NumberedWord[];
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
    savedWords.indexOf(ownProps.word) > -1
      ? ownProps.classNames.concat("fade-word")
      : ownProps.classNames
});

const MarkedWord = connect<Word, null, { index: number }>(
  markedWordStateToProps
)(NumberedWordView);

export class UnknownWordList extends React.PureComponent<Props> {
  private clickStrategy: TextClickStrategy;

  constructor(props: Props) {
    super(props);
    this.onWordClick = this.onWordClick.bind(this);
    this.clickStrategy = {
      onWordClick: this.onWordClick,
      onContextMenu: _.stubTrue
    };
    this.clickStrategy.onWordClick.bind(this.clickStrategy);
    this.clickStrategy.onContextMenu.bind(this.clickStrategy);
  }

  onWordClick(wordId: number) {
    this.props.onWordClick(this.props.words[wordId].index);
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
          clickStrategy={this.clickStrategy}
        />
      </KeyboardSelectableContainer>
    ) : (
      "No marked words"
    );
  }
}

export default connect<
  PropsFromState,
  PropsFromDispatch,
  { tabIndex?: number },
  State
>(
  ({ cardState, words }) => ({
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
