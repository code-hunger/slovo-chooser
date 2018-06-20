import * as React from "react";
import TextEditorKeyboardHandler from "../KeyboardOperations";
import * as _ from "lodash";

interface Props {
  elementCount: number;
  onSelectElement: (element: number) => void;
}

interface State {
  currentNumberTyped: number;
}

export class KeyboardSelectableContainer extends React.PureComponent<Props, State> {
  private styles: React.CSSProperties = { position: "relative" };
  state = { currentNumberTyped: 0 };

  constructor(props: Props) {
    super(props);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  onKeyDown(e: React.KeyboardEvent<HTMLElement>) {
    TextEditorKeyboardHandler(
      this.state.currentNumberTyped,
      this.props.elementCount,
      e,
      id => this.props.onSelectElement(id),
      id => this.setState({ currentNumberTyped: id })
    );
  }

  render() {
    const value = this.state.currentNumberTyped;

    return (
      <div style={this.styles} onKeyDown={this.onKeyDown}>
        {!value ? null : (
          <div id="wordNumberTyped">Currently typing: {value}</div>
        )}
        {this.props.children}
      </div>
    );
  }
}
