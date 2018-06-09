import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { State, WordAction } from "./store";
import { TextClickStrategy, ContextSelector } from "./TextClickStrategies";

import { NumberedWord, NumberedWordView } from "./Word";
import { WordCollector, WordCollectorProps } from "./WordCollector";
import { KeyboardSelectableContainer } from "./NumberSelectableContainer";

type TextEditorProps = PropsFromState & PropsFromDispatch & PropsFromOutside;

interface TextEditorState {
  words: NumberedWord[];
  contextBoundaries: { start: number; length: number };
}

class TextEditor extends React.PureComponent<TextEditorProps> {
  wordRightClicked(wordId: number) {
    return;
  }

  render() {
    //@TODO move to constructor
    const wordCollectorProps: WordCollectorProps = {
      words: this.props.words,
      wordType: this.props.wordType,
      tabIndex: this.props.tabIndex,
      onWordClick: this.props.onWordClick,
      onWordRightClick: this.props.onContextMenu
    };

    return this.props.words.length ? (
      <div
        className={
          "textEditor " +
          (this.props.clickStrategy === ContextSelector ? "selectContext" : " ")
        }
      >
        <KeyboardSelectableContainer
          elementCount={this.props.words.length}
          onSelectElement={wordCollectorProps.onWordClick}
        >
          <WordCollector {...wordCollectorProps} />
        </KeyboardSelectableContainer>
      </div>
    ) : (
      this.props.emptyText
    );
  }
}

const mapStateToProps = ({ wordState: { words, contextBoundaries } }) => ({
  words,
  contextBoundaries
});

const mapDispatchToProps = (
  dispatch: Dispatch<State>,
  ownProps: TextEditorProps
): PropsFromDispatch => ({
  onWordClick(wordId: number) {
    ownProps.clickStrategy.onWordClick(wordId, dispatch);
  },
  onContextMenu(wordId: number) {
    ownProps.clickStrategy.onWordClick(wordId, dispatch);
  }
});

interface PropsFromState {
  readonly words: NumberedWord[];
  readonly contextBoundaries: { start: number; length: number };
}

interface PropsFromDispatch {
  onWordClick(wordId: number);
  onContextMenu(wordId: number);
}

interface PropsFromOutside {
  tabIndex: number;
  emptyText: string;
  wordType: React.ComponentClass | React.StatelessComponent;
  clickStrategy: TextClickStrategy;
}

export default connect<PropsFromState, PropsFromDispatch, PropsFromOutside>(
  mapStateToProps,
  mapDispatchToProps
)(TextEditor);
