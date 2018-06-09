import * as React from "react";
import { Word, NumberedWord, NumberedWordView } from "./Word";
import { WordCollector } from "./WordCollector";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "./TextClickStrategies";

import * as _ from "lodash";
import store from "./store";

interface Props {
  readonly selectedUnknown: number[];
  readonly notSelectedUnknown: number[];
  readonly clickStrategy: TextClickStrategy;
  readonly onSave: (obj: any) => void;
  readonly words: Word[];
  readonly contextString: string;

  readonly switchToNextChunk: () => void;
  readonly chunkId: number;
}

interface State {
  readonly unknownField: string;
  readonly unknownFieldMeaning: string;
  readonly dictionarySearch: string;
}

function cleanOldWords(unknownField: string, oldWords: string[]) {
  return oldWords.reduce((str, word) => str.replace(word, ""), unknownField);
}

function updateFieldWithNewHints(
  field: string,
  removedWords: string[],
  addedWords: string[]
) {
  return [
    cleanOldWords(field, removedWords)
      .replace(/\s{2,}/, " ")
      .trim()
  ]
    .concat(addedWords.filter(w => !field.includes(w))) // add words only if not already there
    .join(" ")
    .trim();
}

interface DictionaryProps {
  word: string;
}

class DictionaryView extends React.Component<DictionaryProps> {
  render() {
    console.log("Dictionary render");
    let src;
    src = "https://slovored.com/search/all/" + this.props.word;
    //src = "http://localhost:3001/showdict?word=" + this.props.word;
    return <iframe src={src} width="100%" />;
  }
}

export class CardEditor extends React.Component<Props, State> {
  static MIN_WORD_LENGTH = 3;

  constructor(props: Props) {
    super(props);
    this.onchange = this.onchange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    this.loadDictionary = this.loadDictionary.bind(this);
    this.onSave = this.onSave.bind(this);
    this.resetState = this.resetState.bind(this);
    this.trySwitchToNextChunk = this.trySwitchToNextChunk.bind(this);

    this.state = {
      unknownField: "",
      unknownFieldMeaning: "",
      dictionarySearch: ""
    };
  }

  shouldComponentUpdate(nextProps: Props, newState: State) {
    return !(
      _.isEqual(this.props.selectedUnknown, nextProps.selectedUnknown) &&
      this.state.unknownField === newState.unknownField &&
      this.state.unknownFieldMeaning === newState.unknownFieldMeaning &&
      this.state.dictionarySearch === newState.dictionarySearch &&
      this.props.contextString === nextProps.contextString &&
      this.props.clickStrategy === nextProps.clickStrategy
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

    const newHints = nextProps.selectedUnknown,
      oldHints = this.props.selectedUnknown;

    const wordedOld = oldHints.map(hint => this.props.words[hint].word),
      wordedNew = newHints.map(hint => nextProps.words[hint].word);

    // Could be optimized, but no need for that
    const addedWords = _.difference(wordedNew, wordedOld),
      removedWords = _.difference(wordedOld, wordedNew);

    if (addedWords.length || removedWords.length) {
      this.setState(({ unknownField }) => ({
        unknownField: updateFieldWithNewHints(
          unknownField,
          removedWords,
          addedWords
        )
      }));
    }
  }

  onchange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    switch (e.target.name) {
      case "unknownField":
        const selectedUnknown = this.props.selectedUnknown,
          notSelectedUnknown = this.props.notSelectedUnknown,
          unknownField = e.target.value;

        this.setState({ unknownField });

        const hasWord = id => unknownField.includes(this.props.words[id].word);
        const removedSelectedUnknown = selectedUnknown.filter(
          _.negate(hasWord)
        );
        const addedSelectedUnknown = notSelectedUnknown.filter(hasWord);

        if (removedSelectedUnknown.length || addedSelectedUnknown.length) {
          store.dispatch({
            type: "TOGGLE_EDITED_UNKNOWN_WORDS",
            added: addedSelectedUnknown,
            removed: removedSelectedUnknown
          });
        }
        break;
      case "unknownFieldMeaning":
        const unknownFieldMeaning = e.target.value;
        this.setState({ unknownFieldMeaning });
    }
  }

  onKeyDown(e: any) {
    switch (e.target.name) {
      case "unknownField":
        if (e.keyCode === 13) this.loadDictionary();
        break;
      case "unknownFieldMeaning":
        break;
    }
  }

  loadDictionary() {
    this.setState(state => ({ dictionarySearch: state.unknownField }));
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
          <>
            <input
              key="unknownField"
              name="unknownField"
              value={this.state.unknownField}
              onChange={this.onchange}
              onKeyDown={this.onKeyDown}
            />
            {this.state.unknownField.length >= CardEditor.MIN_WORD_LENGTH ? (
              <button onClick={this.loadDictionary}>Find in dictionary</button>
            ) : null}
          </>,
          ...(dictionarySearch.length > CardEditor.MIN_WORD_LENGTH
            ? [
                <>
                  Dictionary results for <strong>{dictionarySearch}</strong>:
                  <DictionaryView word={dictionarySearch} key="dictionary" />
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
                          {this.props.clickStrategy !== ContextSelector ||
                          !this.props.contextString ? (
                            <button
                              onClick={() =>
                                store.dispatch({
                                  type: "SET_TEXT_CLICK_STRATEGY",
                                  strategy: ContextSelector
                                })
                              }
                            >
                              Select context words
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                store.dispatch({
                                  type: "SET_TEXT_CLICK_STRATEGY",
                                  strategy: UnknownWordSelector
                                })
                              }
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
