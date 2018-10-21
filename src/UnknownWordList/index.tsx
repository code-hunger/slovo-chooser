import * as React from "react";
import { stubTrue } from "lodash";

import { Word, NumberedWord } from "../Word";
import { WordCollector } from "shadow-cljs/project.WordCollector";
import { KeyboardSelectableContainer } from "shadow-cljs/project.keyboardFocusable";
import { handler } from "shadow-cljs/project.TEKeyboardHandler";

import Typography from "@material-ui/core/Typography";

type Props = {
  tabIndex?: number;
  words: NumberedWord[];
  onWordClick: (id: number) => void;
  wordType: React.ComponentClass | React.StatelessComponent;
};

export default class UnknownWordList extends React.PureComponent<Props> {
  constructor(props: Props) {
    super(props);
    this.onWordClick = this.onWordClick.bind(this);
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
        handler={handler}
      >
        <WordCollector
          className="unknownWordsList"
          wordType={this.props.wordType}
          words={this.props.words}
          tabIndex={this.props.tabIndex}
          onWordClick={this.onWordClick}
          onContextMenu={stubTrue}
        />
      </KeyboardSelectableContainer>
    ) : (
      <Typography variant="subheading">No marked words</Typography>
    );
  }
}
