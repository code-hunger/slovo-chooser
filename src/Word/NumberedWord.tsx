import * as React from "react";

import { Clickable, Word } from "./index";
import { SimpleWord } from "./SimpleWord";

export interface NumberedWord extends Word {
  readonly index: number;
}

type NumberedWordViewProps = NumberedWord & {
  insideBoundaries: boolean;
  onClick: (index: number, e: React.MouseEvent<HTMLElement>) => void;
  onContextMenu: (index: number, e: React.MouseEvent<HTMLElement>) => void;
};

interface NumberedWordViewState {
  classes: string[];
}

export class NumberedWordView extends React.PureComponent<
  NumberedWordViewProps,
  NumberedWordViewState
> {
  state = { classes: [] };

  componentWillReceiveProps(newProps: NumberedWordViewProps) {
    if (
      newProps.classNames !== this.props.classNames ||
      newProps.insideBoundaries !== this.props.insideBoundaries
    ) {
      this.setState({
        classes: newProps.classNames.concat(
          newProps.insideBoundaries ? "boundary" : ""
        )
      });
    }
  }

  onClick = e => this.props.onClick(this.props.index, e);
  onContextMenu = e => this.props.onContextMenu(this.props.index, e);

  render() {
    const props = this.props;
    return (
      <div className="word-wrapper">
        <SimpleWord
          word={props.word}
          onClick={this.onClick}
          onContextMenu={this.onContextMenu}
          classNames={this.state.classes}
        />
        <div className="word-tooltip">{props.index + 1}</div>
      </div>
    );
  }
}
