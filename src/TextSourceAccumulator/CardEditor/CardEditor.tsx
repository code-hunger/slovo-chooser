import * as React from "react";
import Input from "@material-ui/core/Input";
import Typography from "@material-ui/core/Typography";

import { Word, NumberedWord } from "../../Word";
import UnknownField from "./UnknownFieldInput";
import Button from "@material-ui/core/Button";

import { isEqual } from "lodash";
import { ContextBoundaries } from "../../reducers/cardState";
import { SavedWord } from "../../reducers/savedChunks";
import ContextStringField, {
  generateContextString
} from "./ContextStringField";

interface Props {
  readonly onSave: (obj: SavedWord, chunkId: number) => void;
  readonly switchChunk: (direction: 1 | -1) => void;
  readonly dictionary:
    | React.ComponentClass<{ word: string }>
    | React.StatelessComponent<{ word: string }>;

  readonly chunkId: number;

  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;

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

export default class CardEditor extends React.Component<Props, State> {
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
      this.state.unknownField === newState.unknownField &&
      this.state.unknownFieldMeaning === newState.unknownFieldMeaning &&
      this.state.dictionarySearch === newState.dictionarySearch &&
      this.props.contextBoundaries === nextProps.contextBoundaries
    );
  }

  resetState = () => {
    this.setState({
      unknownField: "",
      unknownFieldMeaning: "",
      dictionarySearch: ""
    });
  };

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

  onchange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    switch (e.target.name) {
      case "unknownFieldMeaning":
        const unknownFieldMeaning = e.target.value;
        this.setState({ unknownFieldMeaning });
    }
  };

  loadDictionary = (value: string) =>
    this.setState({ dictionarySearch: value, unknownField: value });

  trySwitchChunk = (direction: 1 | -1) => {
    if (this.state.unknownField.length <= 1 || confirm("Are you sure?")) {
      this.resetState();
      this.props.switchChunk(direction);
    }
  };

  trySwitchToNextChunk = () => this.trySwitchChunk(1);

  trySwitchToPrevChunk = () => this.trySwitchChunk(-1);

  onSave = () => {
    this.props.onSave(
      {
        word: this.state.unknownField,
        meaning: this.state.unknownFieldMeaning,
        context: generateContextString(
          this.props.contextBoundaries,
          this.props.words
        )
      },
      this.props.chunkId
    );
    this.resetState();
  };

  render() {
    const dictionarySearch = this.state.dictionarySearch;
    // @TODO: Improve nested conditional rendering.
    // E.g., remove conditional rendering and render everything while setting className='hidden'
    return (
      <div className="cardEditor">
        <div className="cardEditorRow">
          <UnknownField key="unknownField" onReady={this.loadDictionary} />
        </div>
        {dictionarySearch.length ? (
          <>
            <div className="cardEditorRow">
              Dictionary results for <strong>{dictionarySearch}</strong>:
              <this.props.dictionary word={dictionarySearch} />
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
            {this.state.unknownFieldMeaning.length > 1 ? (
              <div className="cardEditorRow">
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
                <ContextStringField
                  unknownWord={dictionarySearch}
                  onReady={this.props.toggleSelectingContext}
                />
                <Button
                  size="small"
                  onClick={this.props.toggleSelectingContext}
                >
                  Select context words
                </Button>
              </div>
            ) : null}
          </>
        ) : null}
        <Button
          key="nextChunkButton"
          color="default"
          variant="outlined"
          onClick={this.trySwitchToNextChunk}
          name="nextChunkButton"
        >
          To next chunk
        </Button>
        <Button
          key="prevChunkButton"
          color="default"
          variant="outlined"
          onClick={this.trySwitchToPrevChunk}
          name="prevChunkButton"
        >
          To previous chunk
        </Button>
      </div>
    );
  }
}
