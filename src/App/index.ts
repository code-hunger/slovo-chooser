import App from "./App";
import { pick } from "lodash";

import { State, LocalTextSource } from "../store";
import * as actions from "../actions";
import { CachedPositions } from "../ChunkRetriever";

import { connect } from "react-redux";

interface AppStateProps {
  textSourcePositions: CachedPositions;
  localTextSources: LocalTextSource[];
}

interface AppDispatchProps {
  setText: (text: string, chunkId: number, textSourceId: string) => void;
  textSourceRemover: (source: LocalTextSource) => void;
}

export default connect<AppStateProps, AppDispatchProps, void, State>(
  state => pick(state, ["textSourcePositions", "localTextSources"]),
  dispatch => ({
    setText(text: string, chunkId: number, textSourceId: string) {
      dispatch(actions.setText(text, chunkId, textSourceId));
    },
    textSourceRemover(sourceIndex: LocalTextSource) {
      dispatch(actions.removeLocalTextSource(sourceIndex));
    }
  })
)(App);
