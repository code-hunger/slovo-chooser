import * as React from "react";
import reactbind from "react-bind-decorator";

type TextSourceId = string;

interface TextSource {
  id: TextSourceId;
  description: string;
}

interface Props {
  textSources: TextSource[];
  setTextSource: (id: TextSourceId) => void;
  currentSourceId?: TextSourceId;
}

interface State {}

@reactbind()
export default class TextSourceChooser extends React.PureComponent<Props, State> {
  render() {
    return (
      <>
        Choose a text source:
        <ul>
          {this.props.textSources.map(x => (
            <li key={x.id}>
              <button
                disabled={x.id === this.props.currentSourceId}
                className="anchor"
                onClick={() => this.props.setTextSource(x.id)}
              >
                {x.description}
              </button>
            </li>
          ))}
        </ul>
      </>
    );
  }
}
