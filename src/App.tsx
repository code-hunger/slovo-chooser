import * as React from "react";
import "./App.css";

import TextSourceChooser from "./TextSourceChooser";
import TextEditor from "./TextEditor";
import { CardEditor } from "./CardEditor";
import * as UnknownWordsList from "./UnknownWordsList";
import Dictionary from "./Dictionary";
import { NumberedWord } from "./Word";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "./TextClickStrategies";

import exportToCsv from "./exportToCSV";

import ChunkRetriever from "./ChunkRetriever";

import store, {
  State,
  ContextBoundaries,
  SavedChunks,
  SavedWords,
  SavedWord
} from "./store";

import reactbind from "react-bind-decorator";
import { connect, Dispatch } from "react-redux";
import * as _ from "lodash";

type AppProps = AppStateProps & AppDispatchProps;

interface AppState {
  textClickStrategy: TextClickStrategy;
  isSelectingContext: boolean;
  textSourceId?: number;
  sources: { id: number; description: string }[];
}

@reactbind()
class AppClass extends React.Component<AppProps, AppState> {
  private chunkRetriever: ChunkRetriever;

  constructor(props: AppProps) {
    super(props);

    this.chunkRetriever = new ChunkRetriever(props.chunkId);
    this.chunkRetriever
      .getOptionsFromServer()
      .then(sources => this.setState({ sources }));

    this.state = {
      textClickStrategy: UnknownWordSelector(store.dispatch),
      isSelectingContext: false,
      textSourceId: undefined,
      sources: this.chunkRetriever.getOptions()
    };
  }

  switchToNextChunk(textSourceId, chunkId: number = 1 + this.props.chunkId) {
    if (!this.props.marked.length && this.props.words.length)
      if (!confirm("Nothing saved from this chunk!")) return;

    this.chunkRetriever
      .getNextChunk(textSourceId, chunkId)
      .then(chunk =>
        this.props.setText(
          chunk.text || (alert("No text from server"), ""),
          chunk.newId
        )
      );
  }

  generateCsvFile() {
    const csvArray = _.flatMap(this.props.savedChunks).map(_.values);
    exportToCsv("anki_export.csv", csvArray);
  }

  provideWordSelectControls() {
    this.setState({
      textClickStrategy: UnknownWordSelector(store.dispatch),
      isSelectingContext: false
    });
  }

  provideContextSelectControls() {
    this.setState({
      textClickStrategy: ContextSelector(
        store.dispatch,
        this.props.words.length
      ),
      isSelectingContext: true
    });
  }

  setTextSource(id: number) {
    if (
      !_.isUndefined(this.state.textSourceId) &&
      this.state.textSourceId === id
    )
      return;

    this.setState({ textSourceId: id }, () =>
      this.switchToNextChunk(id, this.props.chunkId)
    );
  }

  render() {
    const editedMarked = this.props.editedMarked,
      words = this.props.words;

    const marked: NumberedWord[] = this.props.marked.map((id, index) => ({
      word: words[id].word,
      index,
      classNames: words[id].classNames
    }));

    const selectedUnknown = editedMarked;
    const notSelectedUnknown = _.without(
      marked.map(w => w.index),
      ...selectedUnknown
    );

    const contextString =
      this.props.contextBoundaries &&
      (({ start, length }) =>
        words
          .slice(start, start + length + 1)
          .reduce((str, { word }) => str + " " + word, ""))(
        this.props.contextBoundaries
      );

    return (
      <>
        <TextSourceChooser
          textSources={this.state.sources}
          setTextSource={this.setTextSource}
          currentSourceId={this.state.textSourceId}
        />
        <div className="App">
          <h3>Choose words to check meaning:</h3>

          <TextEditor
            tabIndex={0}
            emptyText="Loading text..."
            onWordClick={this.state.textClickStrategy.onWordClick.bind(
              this.state.textClickStrategy
            )}
            onContextMenu={this.state.textClickStrategy.onContextMenu.bind(
              this.state.textClickStrategy
            )}
            className={
              "textEditor " +
              (this.state.isSelectingContext ? "selectContext" : " ")
            }
          />

          <h3>Marked unknown:</h3>
          <UnknownWordsList.View words={marked} tabIndex={0} />

          <CardEditor
            selectedUnknown={selectedUnknown}
            notSelectedUnknown={notSelectedUnknown}
            contextString={contextString}
            provideWordSelectControls={this.provideWordSelectControls}
            provideContextSelectControls={this.provideContextSelectControls}
            isSelectingContext={this.state.isSelectingContext}
            switchToNextChunk={this.switchToNextChunk.bind(
              this,
              this.state.textSourceId
            )}
            words={marked}
            onSave={this.props.onCardSave}
            chunkId={this.props.chunkId}
            dictionary={Dictionary}
          />
          <>{JSON.stringify(this.props.savedWords)}</>
          <>{JSON.stringify(this.props.savedChunks)}</>

          <button className="anchor block" onClick={this.generateCsvFile}>
            Generate a <kbd>csv</kbd> file for anki
          </button>
        </div>
      </>
    );
  }
}

interface AppStateProps {
  words: NumberedWord[];
  savedWords: string[];
  savedChunks: SavedChunks;
  marked: number[];
  editedMarked: number[];
  contextBoundaries: ContextBoundaries;

  chunkId: number;
}

interface AppDispatchProps {
  onCardSave: (obj: SavedWord) => void;
  setText: (text: string, chunkId: number) => void;
}

const mapStateToProps = ({
  wordState: {
    words,
    savedWords,
    marked,
    editedMarked,
    contextBoundaries,
    chunkId,
    savedChunks
  }
}: State): AppStateProps => ({
  words,
  savedWords,
  marked,
  editedMarked,
  contextBoundaries,
  chunkId,
  savedChunks
});

const mapDispatchToProps = (dispatch: Dispatch<State>): AppDispatchProps => ({
  onCardSave(obj: SavedWord) {
    dispatch({ type: "SAVE_WORD", obj });
  },
  setText(text: string, chunkId: number) {
    dispatch({ type: "SET_TEXT", text, chunkId });
    localStorage.setItem("chunkId", chunkId.toString());
  }
});

const App = connect<AppStateProps, AppDispatchProps, void>(
  mapStateToProps,
  mapDispatchToProps
)(AppClass);
export default App;
