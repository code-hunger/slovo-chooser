import * as React from "react";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";

import { Word, NumberedWord } from "../views/Word";
import { WordCollector } from "../views/WordCollector";
import UnknownField from "../containers/UnknownFieldInput";
import Button from "@material-ui/core/Button";

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
  readonly switchChunk: (direction: 1 | -1) => void;
  readonly dictionary:
    | React.ComponentClass<{ word: string }>
    | React.StatelessComponent<{ word: string }>;
  readonly textSourceId: string;

  isSelectingContext: boolean;

  readonly usedHints: number[];
  readonly chunkId: number;

  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;

  readonly toggleHints: (added: number[], removed: number[]) => void;
  readonly toggleSelectingContext: () => void;
  readonly isDuplicate: (value: string) => boolean;
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

  trySwitchChunk(direction: 1 | -1) {
    if (
      this.state.unknownField.length <= 1 ||
      confirm("Are you sure?") ||
      this.props.usedHints.length
    ) {
      this.resetState();
      this.props.switchChunk(direction);
    }
  }

  trySwitchToNextChunk() {
    this.trySwitchChunk(1);
  }
  trySwitchToPrevChunk() {
    this.trySwitchChunk(-1);
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
        <div className="cardEditorRow">
          <UnknownField
            words={this.state.marked}
            usedHints={this.props.usedHints}
            minLength={CardEditor.MIN_WORD_LENGTH}
            toggleHints={this.props.toggleHints}
            key="unknownField"
            onReady={this.loadDictionary}
            isDuplicate={this.props.isDuplicate}
          />
        </div>
        {dictionarySearch.length > CardEditor.MIN_WORD_LENGTH ?
        <>
          <div className="cardEditorRow">
            Dictionary results for <strong>{dictionarySearch}</strong>:
            <this.props.dictionary word={dictionarySearch}/>
          </div>
          <div className="cardEditorRow">
            Choose meaning from the dictionaries:
            <Input
              name="unknownFieldMeaning"
              multiline
              value={this.state.unknownFieldMeaning}
              onChange={this.onchange}
              margin="dense"
              fullWidth
            />
          </div>
          {this.state.unknownFieldMeaning.length > 2 ? (
            <div className="cardEditorRow">
              <ContextStringField
                unknownWord={dictionarySearch}
                isSelectingContext={this.props.isSelectingContext}
                onReady={this.props.toggleSelectingContext}
              />
              <Button size="small" onClick={this.props.toggleSelectingContext}>
                Select context words
              </Button>
              {this.props.contextBoundaries.length ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={this.onSave}
                >
                  SAVE
                </Button>
              ) : (
                "Choose context!"
              )}
            </div>
          ) : null}
        </>
        : null}
        <Button
          key="nextChunkButton"
          color="default"
          variant="outlined"
          onClick={this.trySwitchToNextChunk}
          className="anchor"
          name="nextChunkButton"
        >
          To next chunk
        </Button>
        <Button
          key="prevChunkButton"
          color="default"
          variant="outlined"
          onClick={this.trySwitchToPrevChunk}
          className="anchor"
          name="prevChunkButton"
        >
          To previous chunk
        </Button>
      </div>
    );
  }
}
