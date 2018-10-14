import * as React from "react";
import { connect } from "react-redux";
import { State } from "../store";
import { pick } from "lodash";

import { NumberedWord } from "../Word";
import TextWord from "./EnhancedTextWord";
import { WordCollector } from "../WordCollector";
import { KeyboardSelectableContainer } from "shadow-cljs/project.keyboardFocusable";
import { handler } from "shadow-cljs/project.TEKeyboardHandler";

type TextEditorProps = PropsFromState & PropsFromOutside;

class TextEditor extends React.PureComponent<TextEditorProps> {
  render() {
    return this.props.words.length ? (
      <div className={"textEditor " + this.props.className}>
        <KeyboardSelectableContainer
          elementCount={this.props.words.length}
          onSelectElement={this.props.onWordClick}
          handler={handler}
        >
          <WordCollector
            words={this.props.words}
            wordType={TextWord}
            tabIndex={this.props.tabIndex}
            onWordClick={this.props.onWordClick}
            onContextMenu={this.props.onContextMenu}
          />
        </KeyboardSelectableContainer>
      </div>
    ) : (
      this.props.emptyText
    );
  }
}

interface PropsFromState {
  readonly words: NumberedWord[];
}

interface PropsFromOutside {
  className: string;
  tabIndex: number;
  emptyText: string;

  onWordClick: (id: number) => void;
  onContextMenu: (word: number) => void;
}

export default connect<PropsFromState, void, PropsFromOutside, State>(
  state => ({ words: state.words })
)(TextEditor);
