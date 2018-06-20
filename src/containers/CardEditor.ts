import * as React from "react";
import { NumberedWord } from "../views/Word";
import CardEditor from "../views/CardEditor";

import store, { SavedWord, State, ContextBoundaries } from "../store";
import { connect } from "react-redux";

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
}

interface PropsFromState {
  readonly usedHints: number[];
  readonly chunkId: number;

  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;
}

interface PropsFromDispatch {
  readonly toggleHints: (added: number[], removed: number[]) => void;
  readonly toggleSelectingContext: () => void;
}

export default connect<PropsFromState, PropsFromDispatch, OutsideProps, State>(
  ({ cardState, words, textSourcePositions }, ownProps) => ({
    chunkId: textSourcePositions[ownProps.textSourceId],
    usedHints: cardState.words.editedMarked,
    marked: cardState.words.marked,
    words: words,
    contextBoundaries: cardState.contextBoundaries
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
      dispatch({
        type: "TOGGLE_SELECTING_CONTEXT_BOUNDARIES"
      });
    }
  })
)(CardEditor);
