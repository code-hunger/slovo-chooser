import * as React from "react";
import { NumberedWord } from "../../Word";
import CardEditor from "./CardEditor";
import { toggleSelectingContext } from "../../actions";

import { SavedWord, State, ContextBoundaries } from "../../store";
import { connect } from "react-redux";

interface OutsideProps {
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
}

interface PropsFromState {
  readonly usedHints: number[];
  readonly chunkId: number;

  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;
  readonly isDuplicate: (value: string) => boolean;
}

interface PropsFromDispatch {
  readonly toggleHints: (added: number[], removed: number[]) => void;
  readonly toggleSelectingContext: () => void;
}

export default connect<PropsFromState, PropsFromDispatch, OutsideProps, State>(
  ({ cardState, words, textSourcePositions, savedWords }, ownProps) => ({
    chunkId: textSourcePositions[ownProps.textSourceId],
    usedHints: cardState.words.editedMarked,
    marked: cardState.words.marked,
    words: words,
    contextBoundaries: cardState.contextBoundaries,

    isDuplicate(value: string) {
      return savedWords.findIndex(w => w === value) > -1;
    }
  }),
  dispatch => ({
    toggleHints(added: number[], removed: number[]) {
      dispatch({
        type: "TOGGLE_EDITED_UNKNOWN_WORDS",
        added,
        removed
      });
    },
    toggleSelectingContext() {
      dispatch(toggleSelectingContext());
    }
  })
)(CardEditor);
