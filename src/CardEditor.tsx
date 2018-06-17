import * as React from "react";
import { Word, NumberedWord, NumberedWordView } from "./Word";
import { WordCollector } from "./WordCollector";
import UnknownField from "./UnknownFieldInput";

import * as _ from "lodash";
import reactbind from "react-bind-decorator";
import store, {
  WordAction,
  SavedWord,
  State as StoreState,
  ContextBoundaries
} from "./store";
import { connect } from "react-redux";

type Props = PropsFromState & OutsideProps;

interface OutsideProps {
  readonly onSave: (
    obj: SavedWord,
    chunkId: number,
    textSourceId: string
  ) => void;
  readonly switchToNextChunk: () => void;
  readonly dictionary: React.ComponentClass<{ word: string }>;
  readonly textSourceId: string;

  isSelectingContext: boolean;
  provideWordSelectControls: () => void;
  provideContextSelectControls: () => void;
}

interface PropsFromState {
  readonly usedHints: number[];
  readonly chunkId: number;

  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;
}

interface State {
  readonly marked: NumberedWord[];

  readonly unknownField: string;
  readonly unknownFieldMeaning: string;
  readonly dictionarySearch: string;
}

function markedIdsToWords({
  marked,
  words
}: {
  marked: number[];
  words: NumberedWord[];
}) {
  return marked.map((id, index) => ({
    word: words[id].word,
    index,
    classNames: words[id].classNames
  }));
}

@reactbind()
class CardEditor extends React.Component<Props, State> {
  static MIN_WORD_LENGTH = 3;

  constructor(props: Props) {
    super(props);

    this.state = {
      marked: markedIdsToWords(props),

      unknownField: "",
      unknownFieldMeaning: "",
      dictionarySearch: ""
    };
  }

  shouldComponentUpdate(nextProps: Props, newState: State) {
    return !(
      _.isEqual(this.props.usedHints, nextProps.usedHints) &&
      this.state.unknownField === newState.unknownField &&
      this.state.unknownFieldMeaning === newState.unknownFieldMeaning &&
      this.state.dictionarySearch === newState.dictionarySearch &&
      this.props.contextBoundaries === nextProps.contextBoundaries &&
      this.props.isSelectingContext === nextProps.isSelectingContext
    );
  }

  resetState() {
    this.setState({
      unknownField: "",
      unknownFieldMeaning: "",
      dictionarySearch: ""
    });
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.chunkId !== this.props.chunkId) {
      // New text chunk; reset state
      this.resetState();
    }

    if (nextProps.marked !== this.props.marked)
      this.setState({
        marked: markedIdsToWords(nextProps)
      });
  }

  onchange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    switch (e.target.name) {
      case "unknownFieldMeaning":
        const unknownFieldMeaning = e.target.value;
        this.setState({ unknownFieldMeaning });
    }
  }

  loadDictionary(value: string) {
    this.setState({ dictionarySearch: value, unknownField: value });
  }

  onContextWordSelect(wordId: number) {
    return;
  }

  trySwitchToNextChunk() {
    if (
      this.state.unknownField.length <= 1 ||
      confirm("Are you sure?") ||
      this.props.usedHints.length
    )
      this.props.switchToNextChunk();
  }

  onSave() {
    this.props.onSave(
      {
        word: this.state.unknownField,
        meaning: this.state.unknownFieldMeaning,
        context: this.contextString()
      },
      this.props.chunkId,
      this.props.textSourceId
    );
    this.resetState();
  }

  toggleHints = (added: number[], removed: number[]) =>
    store.dispatch({
      type: "TOGGLE_EDITED_UNKNOWN_WORDS",
      added,
      removed
    } as WordAction);

  contextString() {
    if (this.props.contextBoundaries.length < 1) return "";

    return (({ start, length }) =>
      this.props.words
        .slice(start, start + length + 1)
        .reduce((str, { word }) => str + " " + word, ""))(
      this.props.contextBoundaries
    );
  }

  render() {
    const dictionarySearch = this.state.dictionarySearch,
      contextString = this.contextString();
    // @TODO: Improve nested conditional rendering.
    // E.g., remove conditional rendering and render everything while setting className='hidden'
    return (
      <div className="cardEditor">
        {[
          <UnknownField
            words={this.props.words}
            usedHints={this.props.usedHints}
            minLength={CardEditor.MIN_WORD_LENGTH}
            toggleHints={this.toggleHints}
            key="unknownField"
            onReady={this.loadDictionary}
          />,
          ...(dictionarySearch.length > CardEditor.MIN_WORD_LENGTH
            ? [
                <>
                  Dictionary results for <strong>{dictionarySearch}</strong>:
                  <this.props.dictionary
                    word={dictionarySearch}
                    key="dictionary"
                  />
                </>,
                <>
                  Choose meaning from the dictionaries:
                  {0 && this.state.unknownFieldMeaning.length < 30 ? (
                    <input
                      name="unknownFieldMeaning"
                      value={this.state.unknownFieldMeaning}
                      onChange={this.onchange}
                    />
                  ) : (
                    <textarea
                      name="unknownFieldMeaning"
                      value={this.state.unknownFieldMeaning}
                      onChange={this.onchange}
                      rows={4}
                      cols={50}
                      className="block"
                    />
                  )}
                </>,
                ...(this.state.unknownFieldMeaning.length > 2
                  ? [
                      <>
                        Choose context sentence for <em>{dictionarySearch}</em>:
                        <p id="contextStringParagraph">
                          {contextString || "No context selected"}
                          {!this.props.isSelectingContext || !contextString ? (
                            <button
                              onClick={this.props.provideContextSelectControls}
                            >
                              Select context words
                            </button>
                          ) : (
                            <button
                              onClick={this.props.provideWordSelectControls}
                            >
                              Done
                            </button>
                          )}
                        </p>
                      </>,
                      contextString || 1 ? (
                        <button onClick={this.onSave}>SAVE</button>
                      ) : null
                    ]
                  : [])
              ]
            : []),
          <button
            key="nextChunkButton"
            onClick={this.trySwitchToNextChunk}
            className="anchor"
          >
            To next chunk
          </button>
        ].map((element, i) => (
          <div className="cardEditorRow" key={i}>
            {element}
          </div>
        ))}
      </div>
    );
  }
}

const mapStateToProps = (
  state: StoreState,
  ownProps: Props
): PropsFromState => ({
  chunkId: state.textSourcePositions[ownProps.textSourceId],
  usedHints: state.wordState.editedMarked,
  marked: state.wordState.marked,
  words: state.words,
  contextBoundaries: state.contextBoundaries
});

export default connect<PropsFromState, void, OutsideProps, StoreState>(
  mapStateToProps
)(CardEditor);
