import * as React from "react";
import reactbind from "react-bind-decorator";
import store, { State as ReduxStore, WordAction, SavedWord } from "./store";
import { connect, Dispatch } from "react-redux";

type Props = PropsFromDispatch;

interface PropsFromDispatch {
  onDone: (id: string, text: string) => void;
}

interface State {
  id: string;
  value: string;
}

@reactbind()
class TextAdder extends React.PureComponent<Props, State> {
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

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): PropsFromDispatch => ({
  onDone(id: string, text: string) {
    dispatch({
      type: "ADD_LOCAL_TEXT_SOURCE",
      source: {
        id,
        description: id,
        text
      }
    });
  }
});

export default connect<void, PropsFromDispatch, void, ReduxStore>(
  undefined,
  mapDispatchToProps
)(TextAdder);
