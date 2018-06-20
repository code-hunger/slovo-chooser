import * as React from "react";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";

import { Word, NumberedWord, NumberedWordView } from "../views/Word";
import { WordCollector } from "../views/WordCollector";
import UnknownField from "../containers/UnknownFieldInput";

import { isEqual } from "lodash";
import reactbind from "react-bind-decorator";
import { SavedWord, ContextBoundaries } from "../store";
import ContextStringField, {
  generateContextString
} from "../containers/ContextStringField";

interface Props {
  readonly onSave: (
    obj: SavedWord,
    chunkId: number,
    textSourceId: string
  ) => void;
  readonly switchToNextChunk: () => void;
  readonly dictionary: React.ComponentClass<{ word: string }>;
  readonly textSourceId: string;

  isSelectingContext: boolean;

  readonly usedHints: number[];
  readonly chunkId: number;

  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;

  readonly toggleHints: (added: number[], removed: number[]) => void;
  readonly toggleSelectingContext: () => void;
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
export default class CardEditor extends React.Component<Props, State> {
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
      isEqual(this.props.usedHints, nextProps.usedHints) &&
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
        context: generateContextString(
          this.props.contextBoundaries,
          this.props.words
        )
      },
      this.props.chunkId,
      this.props.textSourceId
    );
    this.resetState();
  }

  render() {
    const dictionarySearch = this.state.dictionarySearch;
    // @TODO: Improve nested conditional rendering.
    // E.g., remove conditional rendering and render everything while setting className='hidden'
    return (
      <div className="cardEditor">
        {[
          <UnknownField
            words={this.state.marked}
            usedHints={this.props.usedHints}
            minLength={CardEditor.MIN_WORD_LENGTH}
            toggleHints={this.props.toggleHints}
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
                <TextField
                  label="Choose meaning from the dictionaries:"
                  name="unknownFieldMeaning"
                  multiline
                  value={this.state.unknownFieldMeaning}
                  onChange={this.onchange}
                  margin="dense"
                  fullWidth
                />,
                ...(this.state.unknownFieldMeaning.length > 2
                  ? [
                      <>
                        <ContextStringField
                          unknownWord={dictionarySearch}
                          isSelectingContext={this.props.isSelectingContext}
                          onReady={this.props.toggleSelectingContext}
                        />
                        <button onClick={this.props.toggleSelectingContext}>
                          Select context words
                        </button>
                      </>,
                      this.props.contextBoundaries.length ? (
                        <button onClick={this.onSave}>SAVE</button>
                      ) : (
                        "Choose context!"
                      )
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
