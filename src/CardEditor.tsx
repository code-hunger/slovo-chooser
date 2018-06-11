import * as React from "react";
import { Word, NumberedWord, NumberedWordView } from "./Word";
import { WordCollector } from "./WordCollector";
import UnknownField from "./UnknownFieldInput";

import * as _ from "lodash";
import reactbind from 'react-bind-decorator';
import store, { WordAction, SavedWord } from "./store";

interface Props {
  readonly selectedUnknown: number[];
  readonly notSelectedUnknown: number[];
  readonly onSave: (obj: SavedWord) => void;
  readonly words: Word[];
  readonly contextString: string;

  readonly switchToNextChunk: () => void;
  readonly chunkId: number;
  readonly dictionary: React.ComponentClass<{ word: string }>;

  isSelectingContext: boolean;
  provideWordSelectControls: () => void;
  provideContextSelectControls: () => void;
}

interface State {
  readonly unknownField: string;
  readonly unknownFieldMeaning: string;
  readonly dictionarySearch: string;
}

@reactbind()
export class CardEditor extends React.Component<Props, State> {
  static MIN_WORD_LENGTH = 3;

  state = {
    unknownField: "",
    unknownFieldMeaning: "",
    dictionarySearch: ""
  };

  shouldComponentUpdate(nextProps: Props, newState: State) {
    return !(
      _.isEqual(this.props.selectedUnknown, nextProps.selectedUnknown) &&
      this.state.unknownField === newState.unknownField &&
      this.state.unknownFieldMeaning === newState.unknownFieldMeaning &&
      this.state.dictionarySearch === newState.dictionarySearch &&
      this.props.contextString === nextProps.contextString &&
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
      this.props.selectedUnknown.length
    )
      this.props.switchToNextChunk();
  }

  onSave() {
    this.props.onSave({
      word: this.state.unknownField,
      meaning: this.state.unknownFieldMeaning,
      context: this.props.contextString
    });
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
            words={this.props.words}
            usedHints={this.props.selectedUnknown}
            unusedHints={this.props.notSelectedUnknown}
            minLength={CardEditor.MIN_WORD_LENGTH}
            toggleHints={(added, removed) =>
              store.dispatch({
                type: "TOGGLE_EDITED_UNKNOWN_WORDS",
                added,
                removed
              } as WordAction)
            }
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
                          {this.props.contextString || "No context selected"}
                          {!this.props.isSelectingContext ||
                          !this.props.contextString ? (
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
                      this.props.contextString || 1 ? (
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
