import * as React from "react";
import { WordAction, State, ContextBoundaries } from "../../store";
import { connect } from "react-redux";
import { Word, NumberedWord } from "../../Word";

type Props = PropsFromState & PropsFromOutside;

interface PropsFromOutside {
  unknownWord: string;
  onReady: () => void;
}

interface PropsFromState {
  words: NumberedWord[];
  contextBoundaries: ContextBoundaries;
  isSelectingContext: boolean;
}

export function generateContextString(
  contextBoundaries: ContextBoundaries,
  words: NumberedWord[]
) {
  if (contextBoundaries.length < 1) return "";

  return (({ start, length }) =>
    words
      .slice(start, start + length + 1)
      .reduce((str, { word }) => str + " " + word, ""))(contextBoundaries);
}

class ContextStringField extends React.PureComponent<Props> {
  render() {
    const contextString = generateContextString(
      this.props.contextBoundaries,
      this.props.words
    );
    return (
      <>
        Choose context sentence for <em>{this.props.unknownWord}</em>:
        {contextString ? (
          <input disabled value={contextString} />
        ) : (
          "No context selected"
        )}
        {!this.props.isSelectingContext || !contextString ? null : (
          <button onClick={this.props.onReady}>Done</button>
        )}
      </>
    );
  }
}

const mapStateToProps = (state: State): PropsFromState => ({
  contextBoundaries: state.cardState.contextBoundaries,
  words: state.words,
  isSelectingContext: state.cardState.isSelectingContext
});

export default connect<PropsFromState, void, PropsFromOutside, State>(
  mapStateToProps,
)(ContextStringField);
