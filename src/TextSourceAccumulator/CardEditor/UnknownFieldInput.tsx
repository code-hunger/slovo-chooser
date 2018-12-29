import * as React from "react";
import { difference, trim, negate, without, throttle } from "lodash";
import { Word, NumberedWord } from "../../Word";

import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";

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
  PropsFromState & PropsFromDispatch & PropsFromOutside,
  UnknownFieldState
> {
  state = { value: "", isDuplicate: false };

  updateDuplicateState = throttle(() => {
    this.setState(state => ({
      isDuplicate: this.isDuplicate(state.value)
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
  };

  isDuplicate = (value: string) =>
    this.props.savedWords.findIndex(w => w === value) > -1;

  componentWillReceiveProps(nextProps: PropsFromState) {
    const newHints = nextProps.usedHints,
      oldHints = this.props.usedHints;

    const wordedOld = oldHints.map(
        hint => this.props.words[this.props.marked[hint]].word
      ),
      wordedNew = newHints.map(
        hint => nextProps.words[nextProps.marked[hint]].word
      );

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
  };

  onKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.keyCode === 13) this.onReady();
  };

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

import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { State } from "src/store";
import { toggleEditedUnknownWords } from "../../actions";

interface PropsFromOutside {
  onReady: (value: string) => void;
}
interface PropsFromDispatch {
  toggleHints: (added: number[], removed: number[]) => void;
}
interface PropsFromState {
  words: NumberedWord[];
  marked: number[];
  usedHints: number[];
  savedWords: string[];
}

export default connect<
  PropsFromState,
  PropsFromDispatch,
  PropsFromOutside,
  State
>(
  ({ cardState, words, savedWords }: State) => ({
    usedHints: cardState.words.editedMarked,
    marked: cardState.words.marked,
    words,
    savedWords
  }),
  dispatch =>
    bindActionCreators({ toggleHints: toggleEditedUnknownWords }, dispatch)
)(UnknownField);
