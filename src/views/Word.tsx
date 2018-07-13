import * as React from "react";

export interface Word {
  readonly word: string;
  classNames: string[];
}

export interface Clickable {
  onClick: React.MouseEventHandler<HTMLElement>;
  onContextMenu?: React.MouseEventHandler<HTMLElement>;
}

export interface NumberedWord extends Word {
  readonly index: number;
}

export class SimpleWord extends React.PureComponent<
  Clickable & Word,
  { className: string }
> {
  state = { className: "word" };
  componentWillReceiveProps(newProps: Clickable & Word) {
    if (newProps.classNames !== this.props.classNames)
      this.setState({
        className: newProps.classNames.concat("word").join(" ")
      });
  }
  render() {
    const props = this.props;
    const className = this.state.className;

    return (
      <div
        {...{
          className,
          onClick: props.onClick,
          title: props.word,
          onContextMenu: props.onContextMenu
        }}
      >
        {props.word}
      </div>
    );
  }
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
