import * as React from "react";
import { NumberedWord } from "../../Word";
import CardEditor from "./CardEditor";
import {
  toggleEditedUnknownWords,
  toggleSelectingContext
} from "../../actions";

import { SavedWord, State, ContextBoundaries } from "../../store";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

interface OutsideProps {
  readonly onSave: (obj: SavedWord, chunkId: number) => void;
  readonly switchChunk: (direction: 1 | -1) => void;
  readonly dictionary:
    | React.ComponentClass<{ word: string }>
    | React.StatelessComponent<{ word: string }>;
  readonly chunkId: number;
}

interface PropsFromState {
  readonly marked: number[];
  readonly words: NumberedWord[];
  readonly contextBoundaries: ContextBoundaries;
}

interface PropsFromDispatch {
  readonly toggleSelectingContext: () => void;
}

export default connect<PropsFromState, PropsFromDispatch, OutsideProps, State>(
  ({ cardState, words, savedWords }, ownProps) => ({
    marked: cardState.words.marked,
    words: words,
    contextBoundaries: cardState.contextBoundaries,
  }),
  dispatch => bindActionCreators({ toggleSelectingContext }, dispatch)
)(CardEditor);
