import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { State, WordAction, SavedWord } from "../store";
import { saveWord } from "../actions";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "../TextClickStrategies";
import { NumberedWord } from "../Word";
import TextSourceAccumulator from "../TextSourceAccumulator";
import { CachedPositions } from "src/ChunkRetriever";

type Props = PropsFromState & PropsFromDispatch & PropsFromOutside;

interface PropsFromOutside {
  textSourceId: string;
  switchChunk: (direction: 1 | -1) => void;
}

interface PropsFromState {
  words: NumberedWord[];
  isSelectingContext: boolean;
  textSourcePositions: CachedPositions;
}

interface PropsFromDispatch {
  onCardSave: (obj: SavedWord, chunkId: number, textSourceId: string) => void;

  onWordClick: (strategy: TextClickStrategy, word: number) => void;
  onContextMenu: (strategy: TextClickStrategy, word: number) => void;
}

const mapStateToProps = ({
  words,
  savedChunks,
  textSourcePositions,
  cardState: { isSelectingContext }
}: State): PropsFromState => ({
  words,
  textSourcePositions,
  isSelectingContext
});

export default connect<
  PropsFromState,
  PropsFromDispatch,
  PropsFromOutside,
  State
>(
  mapStateToProps,
  dispatch => ({
    ...bindActionCreators({ onCardSave: saveWord }, dispatch),
    onWordClick(strategy, id) {
      const action = strategy.onWordClick(id);
      if (action) dispatch(action);
    },
    onContextMenu(strategy, id) {
      const action = strategy.onContextMenu(id);
      if (action) dispatch(action);
    }
  })
)(TextSourceAccumulator);
