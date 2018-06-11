import * as React from "react";
import reactbind from "react-bind-decorator";

interface TextSource {
  id: number;
  description: string;
}

interface Props {
  textSources: TextSource[];
  setTextSource: (id: number) => void;
}

interface State {}

@reactbind()
export default class TextSourceChooser extends React.Component<Props, State> {
  render() {
    return (
      <>
        Choose a text source:
        <ul>
          {this.props.textSources.map(x => (
            <li>
              <button
                className="anochor"
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
