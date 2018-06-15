import * as React from "react";
import { TextAdder } from "./TextAdder";

interface TextSource<IdType> {
  id: IdType;
  description: string;
  chunkId?: number;
}

interface Props<IdType> {
  textSources: TextSource<IdType>[];
  setTextSource: (id: IdType) => void;
  addTextSource?: (id: string, text: string) => void;
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
          <li>
            {this.props.addTextSource ? (
              <TextAdder onDone={this.props.addTextSource} />
            ) : null}
          </li>
          {this.props.textSources.map(x => (
            <li key={x.id.toString()}>
              <button
                disabled={x.id === this.props.currentSourceId}
                className="anchor"
                onClick={() => this.props.setTextSource(x.id)}
              >
                {x.description}
              </button>{" "}
              {x.chunkId}
            </li>
          ))}
        </ul>
      </>
    );
  }
}
