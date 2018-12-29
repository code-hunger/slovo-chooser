import * as React from "react";
import { difference, trim, negate, without, throttle } from "lodash";
import { Word, NumberedWord } from "../../Word";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

interface UnknownFieldProps {
  words: NumberedWord[];
  usedHints: number[];

  onReady: (value: string) => void;
  toggleHints: (added: number[], removed: number[]) => void;
  isDuplicate: (value: string) => boolean;
}

interface UnknownFieldState {
  value: string;
  isDuplicate: boolean;
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

class UnknownField extends React.PureComponent<
  UnknownFieldProps,
  UnknownFieldState
> {
  state = { value: "", isDuplicate: false };

  updateDuplicateState = throttle(() => {
    this.setState(state => ({
      isDuplicate: this.props.isDuplicate(state.value)
    }));
  }, 500);

  onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const usedHints = this.props.usedHints,
      unusedHints = without(
        this.props.words.map(w => w.index),
        ...this.props.usedHints
      ),
      value = e.target.value;

    this.setState({ value });

    const hasWord = (word: number) =>
      value.includes(trim(this.props.words[word].word, "\"',."));
    const removedHints = usedHints.filter(negate(hasWord));
    const addedHints = unusedHints.filter(hasWord);

    if (removedHints.length || addedHints.length) {
      this.props.toggleHints(addedHints, removedHints);
    }

    this.updateDuplicateState();
  }

  componentWillReceiveProps(nextProps: UnknownFieldProps) {
    const newHints = nextProps.usedHints,
      oldHints = this.props.usedHints;

    const wordedOld = oldHints.map(hint => this.props.words[hint].word),
      wordedNew = newHints.map(hint => nextProps.words[hint].word);

    // Could be optimized, but no need for that
    const addedWords = difference(wordedNew, wordedOld),
      removedWords = difference(wordedOld, wordedNew);

    if (addedWords.length || removedWords.length) {
      this.setState(({ value }) => ({
        value: updateFieldWithNewHints(value, removedWords, addedWords)
      }));
    }
  }

  onReady = () => {
    this.props.onReady(this.state.value);
  }

  onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.keyCode === 13) this.onReady();
  }

  render() {
    return (
      <>
        <TextField
          key="unknownField"
          label="Unknown word to search here"
          value={this.state.value}
          onChange={this.onChange}
          onKeyDown={this.onKeyDown}
          fullWidth
        />
        {this.state.isDuplicate ? "It is a duplicate!" : null}
        {this.state.value.length ? (
          <Button variant="outlined" onClick={this.onReady}>
            Find in dictionary
          </Button>
        ) : null}
      </>
    );
  }
}

import {
  toggleEditedUnknownWords,
} from "../../actions";
import { connect } from "react-redux";

export default connect<void, { 
  toggleHints: (added: number[], removed: number[]) => void
 }>(undefined, dispatch => ({
    toggleHints(added: number[], removed: number[]) {
      dispatch(toggleEditedUnknownWords(added, removed));
    }
}))(UnknownField)
