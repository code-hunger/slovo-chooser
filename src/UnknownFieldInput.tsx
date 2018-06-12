import * as React from "react";
import * as _ from "lodash";
import { Word, NumberedWord } from "./Word";
import reactbind from "react-bind-decorator";

interface UnknownFieldProps {
  words: NumberedWord[];
  usedHints: number[];

  onReady: (value: string) => void;
  toggleHints: (added: number[], removed: number[]) => void;

  minLength: number;
}

interface UnknownFieldState {
  value: string;
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

@reactbind()
export default class UnknownField extends React.PureComponent<
  UnknownFieldProps,
  UnknownFieldState
> {
  state = { value: "" };

  onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const usedHints = this.props.usedHints,
      unusedHints = _.without(
        this.props.words.map(w => w.index),
        ...this.props.usedHints
      ),
      value = e.target.value;

    this.setState({ value });

    const hasWord = (word: number) =>
      value.includes(this.props.words[word].word);
    const removedHints = usedHints.filter(_.negate(hasWord));
    const addedHints = unusedHints.filter(hasWord);

    if (removedHints.length || addedHints.length) {
      this.props.toggleHints(addedHints, removedHints);
    }
  }

  componentWillReceiveProps(nextProps: UnknownFieldProps) {
    const newHints = nextProps.usedHints,
      oldHints = this.props.usedHints;

    const wordedOld = oldHints.map(hint => this.props.words[hint].word),
      wordedNew = newHints.map(hint => nextProps.words[hint].word);

    // Could be optimized, but no need for that
    const addedWords = _.difference(wordedNew, wordedOld),
      removedWords = _.difference(wordedOld, wordedNew);

    if (addedWords.length || removedWords.length) {
      this.setState(({ value }) => ({
        value: updateFieldWithNewHints(value, removedWords, addedWords)
      }));
    }
  }

  onReady() {
    this.props.onReady(this.state.value);
  }

  onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode === 13) this.onReady();
  }

  render() {
    return (
      <>
        <input
          key="unknownField"
          name="unknownField"
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
        />
        {this.state.value.length >= this.props.minLength ? (
          <button onClick={this.onReady}>Find in dictionary</button>
        ) : null}
      </>
    );
  }
}
