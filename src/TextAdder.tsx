import * as React from "react";
import reactbind from "react-bind-decorator";

interface Props {
  onDone: (id: string, text: string) => void;
}

interface State {
  id: string;
  value: string;
}

@reactbind()
export class TextAdder extends React.PureComponent<Props, State> {
  state = { id: "", value: "" };

  onChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    switch (e.target.name) {
      case "text":
        this.setState({ value: e.target.value });
        break;
      case "textId":
        this.setState({ id: e.target.value });
        break;
    }
  }

  onDone() {
    this.props.onDone(this.state.id, this.state.value);
    this.setState({ id: "", value: "" });
  }

  render() {
    return (
      <>
        Text source name:
        <input onChange={this.onChange} name="textId" value={this.state.id} />
        <br />
        Paste text here:
        <textarea
          onChange={this.onChange}
          name="text"
          value={this.state.value}
        />
        <button onClick={this.onDone}>Done</button>
      </>
    );
  }
}
