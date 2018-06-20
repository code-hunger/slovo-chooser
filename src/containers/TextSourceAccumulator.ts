import { connect, Dispatch } from "react-redux";

import store, { State, WordAction, SavedChunks, SavedWord } from "../store";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "../TextClickStrategies";
import { NumberedWord } from "../views/Word";
import TextSourceAccumulator from "../views/TextSourceAccumulator";

type Props = PropsFromState & PropsFromDispatch & PropsFromOutside;

interface PropsFromOutside {
  textSourceId: string;
  onReady: () => void;
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

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): PropsFromDispatch => ({
  onCardSave(obj: SavedWord, chunkId: number, textSourceId: string) {
    dispatch({ type: "SAVE_WORD", obj, chunkId, textSourceId });
  }
});

export default connect<
  PropsFromState,
  PropsFromDispatch,
  PropsFromOutside,
  State
>(mapStateToProps, mapDispatchToProps)(TextSourceAccumulator);
