import * as React from "react";

import { Clickable, Word } from "./index";
import { SimpleWord } from "./SimpleWord";

export interface NumberedWord extends Word {
  readonly index: number;
}

type NumberedWordViewProps = NumberedWord &
  Clickable & { insideBoundaries: boolean };

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

  render() {
    const props = this.props;
    return (
      <div className="word-wrapper">
        <SimpleWord
          word={props.word}
          onClick={props.onClick}
          onContextMenu={props.onContextMenu}
          classNames={this.state.classes}
        />
        <div className="word-tooltip">{props.index + 1}</div>
      </div>
    );
  }
}
