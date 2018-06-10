import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { State, WordAction } from "./store";

import { NumberedWord, NumberedWordView } from "./Word";
import { WordCollector, WordCollectorProps } from "./WordCollector";
import { KeyboardSelectableContainer } from "./NumberSelectableContainer";

type TextEditorProps = PropsFromState & PropsFromOutside;

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
          (this.props.className)
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

interface PropsFromState {
  readonly words: NumberedWord[];
  readonly contextBoundaries: { start: number; length: number };
}

interface PropsFromOutside {
  className: string;
  tabIndex: number;
  emptyText: string;

  wordType: React.ComponentClass | React.StatelessComponent;

  onWordClick: (wordId: number) => void;
  onContextMenu: (wordId: number) => void;
}

export default connect<PropsFromState, void, PropsFromOutside>(mapStateToProps)(
  TextEditor
);
