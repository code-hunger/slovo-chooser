import App from "./App";
import { pick } from "lodash";

import { State, LocalTextSource } from "../store";
import * as actions from "../actions";
import { CachedPositions } from "../ChunkRetriever";

import { bindActionCreators } from "redux";
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
  dispatch => bindActionCreators({ setText: actions.setText, textSourceRemover: actions.removeLocalTextSource }, dispatch)
)(App);
