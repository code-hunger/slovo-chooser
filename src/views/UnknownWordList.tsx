import * as React from "react";
import { stubTrue } from "lodash";

import { TextClickStrategy } from "../TextClickStrategies";
import { Word, NumberedWord } from "./Word";
import { WordCollector } from "./WordCollector";
import { KeyboardSelectableContainer } from "../containers/NumberSelectableContainer";

import Typography from "@material-ui/core/Typography";

type Props = {
  tabIndex?: number;
  words: NumberedWord[];
  onWordClick: (id: number) => void;
  wordType: React.ComponentClass | React.StatelessComponent;
};

export default class UnknownWordList extends React.PureComponent<Props> {
  private clickStrategy: TextClickStrategy;

  constructor(props: Props) {
    super(props);
    this.onWordClick = this.onWordClick.bind(this);
    this.clickStrategy = {
      onWordClick: this.onWordClick,
      onContextMenu: stubTrue
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
          wordType={this.props.wordType}
          words={this.props.words}
          tabIndex={this.props.tabIndex}
          clickStrategy={this.clickStrategy}
        />
      </KeyboardSelectableContainer>
    ) : (
      <Typography variant="subheading">No marked words</Typography>
    );
  }
}
