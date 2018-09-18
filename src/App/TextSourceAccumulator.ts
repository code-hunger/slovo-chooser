import { connect } from "react-redux";
import { Dispatch, bindActionCreators } from "redux";

import store, { State, WordAction, SavedChunks, SavedWord } from "../store";
import { saveWord } from "../actions";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "../TextClickStrategies";
import { NumberedWord } from "../Word";
import TextSourceAccumulator from "../TextSourceAccumulator";

type Props = PropsFromState & PropsFromDispatch & PropsFromOutside;

interface PropsFromOutside {
  textSourceId: string;
  switchChunk: (direction: 1 | -1) => void;
}

interface PropsFromState {
  words: NumberedWord[];
  savedChunks: { [chunkId: number]: SavedWord[] };
  textClickStrategy: TextClickStrategy;
  isSelectingContext: boolean;
}

interface PropsFromDispatch {
  onCardSave: (obj: SavedWord, chunkId: number, textSourceId: string) => void;
}

const mapStateToProps = (
  { words, savedChunks, cardState: { isSelectingContext } }: State,
  { textSourceId }: Props
): PropsFromState => ({
  words,
  savedChunks: savedChunks[textSourceId],
  isSelectingContext,
  textClickStrategy: isSelectingContext
    ? new ContextSelector(store.dispatch, words.length)
    : UnknownWordSelector(store.dispatch)
});

export default connect<
  PropsFromState,
  PropsFromDispatch,
  PropsFromOutside,
  State
>(
  mapStateToProps,
  dispatch => bindActionCreators({ onCardSave: saveWord }, dispatch)
)(TextSourceAccumulator);
