import * as React from "react";
import { connect } from "react-redux";
import { State } from "./store";

import { NumberedWord } from "./Word";
import TextWord from "./EnhancedTextWord";
import { WordCollector } from "./WordCollector";
import { KeyboardSelectableContainer } from "./NumberSelectableContainer";
import { TextClickStrategy } from "./TextClickStrategies";

type TextEditorProps = PropsFromState & PropsFromOutside;

class TextEditor extends React.PureComponent<TextEditorProps> {
  render() {
    return this.props.words.length ? (
      <div className={"textEditor " + this.props.className}>
        <KeyboardSelectableContainer
          elementCount={this.props.words.length}
          onSelectElement={this.props.clickStrategy.onWordClick}
        >
          <WordCollector
            words={this.props.words}
            wordType={TextWord}
            tabIndex={this.props.tabIndex}
            clickStrategy={this.props.clickStrategy}
          />
        </KeyboardSelectableContainer>
      </div>
    ) : (
      this.props.emptyText
    );
  }
}

const mapStateToProps = ({
  wordState: { words, contextBoundaries }
}: State) => ({
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

  clickStrategy: TextClickStrategy;
}

export default connect<PropsFromState, void, PropsFromOutside>(mapStateToProps)(
  TextEditor
);
