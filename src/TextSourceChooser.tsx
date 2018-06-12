import * as React from "react";
import reactbind from "react-bind-decorator";

interface TextSource {
  id: number;
  description: string;
}

interface Props {
  textSources: TextSource[];
  setTextSource: (id: number) => void;
  currentSourceId?: number;
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
