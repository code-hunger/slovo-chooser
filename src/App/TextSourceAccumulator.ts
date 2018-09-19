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
  textClickStrategy: {
    onWordClick: (id: number) => void;
    onContextMenu: (word: number) => void;
  };
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
  textClickStrategy: {
    onWordClick(id) {
      const str = isSelectingContext
        ? new ContextSelector(words.length)
        : UnknownWordSelector;
      const action = str.onWordClick(id);
      if (action) store.dispatch(action);
    },
    onContextMenu(id) {
      const str = isSelectingContext
        ? new ContextSelector(words.length)
        : UnknownWordSelector;
      const action = str.onContextMenu(id);
      if (action) store.dispatch(action);
    }
  }
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
