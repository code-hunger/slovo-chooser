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

export class SimpleWord extends React.PureComponent<Clickable & Word> {
  render() {
    const props = this.props;
    const className = props.classNames.concat("word").join(" ");

    return (
      <div
        {...{
          className,
          onClick: props.onClick,
          title: props.word,
          onContextMenu: props.onContextMenu,
        }}
      >
        {props.word}
      </div>
    );
  }
}

export class NumberedWordView extends React.PureComponent<
  NumberedWord & Clickable
> {
  render() {
    const props = this.props;
    return (
      <div className="word-wrapper">
        <SimpleWord {...props} />
        <div className="word-tooltip">{props.index + 1}</div>
      </div>
    );
  }
}
