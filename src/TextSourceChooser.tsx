import * as React from "react";

interface TextSource<IdType> {
  id: IdType;
  description: string;
}

interface Props<IdType> {
  textSources: TextSource<IdType>[];
  setTextSource: (id: IdType) => void;
  currentSourceId?: IdType;
}

interface State {}

export default class TextSourceChooser<IdType> extends React.PureComponent<
  Props<IdType>,
  State
> {
  render() {
    return (
      <>
        Choose a text source:
        <ul>
          {this.props.textSources.map(x => (
            <li key={x.id.toString()}>
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
