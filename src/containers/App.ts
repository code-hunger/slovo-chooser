import App from "../views/App";
import { pick } from "lodash";

import { State, WordAction, LocalTextSource } from "../store";
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
      dispatch({ type: "SET_TEXT", text, chunkId, textSourceId });
    },
    textSourceRemover(sourceIndex: LocalTextSource) {
      dispatch({ type: "REMOVE_LOCAL_TEXT_SOURCE", sourceIndex });
    }
  })
)(App);
