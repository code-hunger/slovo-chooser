import * as React from "react";

import { Clickable, Word } from "./index";

export class SimpleWord extends React.PureComponent<
  Clickable & Word,
  { className: string }
> {
  state = { className: this.props.classNames.concat(["word"]).join(" ") };

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
