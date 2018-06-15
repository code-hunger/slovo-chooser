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

import ChunkRetriever, { CachedPositions } from "./ChunkRetriever";

import store, {
  State,
  WordAction,
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
  textSourceId?: string;
  sources: { id: string; description: string; chunkId: number }[];

  marked: NumberedWord[];
}

function markedIdsToWords({
  marked,
  words
}: {
  marked: number[];
  words: NumberedWord[];
}) {
  return marked.map((id, index) => ({
    word: words[id].word,
    index,
    classNames: words[id].classNames
  }));
}

@reactbind()
class AppClass extends React.Component<AppProps, AppState> {
  private chunkRetriever: ChunkRetriever;

  constructor(props: AppProps) {
    super(props);

    this.chunkRetriever = new ChunkRetriever(this.props.textSourcePositions);
    this.chunkRetriever
      .getOptionsFromServer()
      .then(sources => this.setState({ sources }));

    this.state = {
      textClickStrategy: UnknownWordSelector(store.dispatch),
      isSelectingContext: false,
      textSourceId: undefined,
      marked: markedIdsToWords(props),
      sources: this.chunkRetriever.getOptions()
    };
  }

  componentWillReceiveProps(newProps: AppProps) {
    if (newProps.marked !== this.props.marked)
      this.setState({
        marked: markedIdsToWords(newProps)
      });
  }

  switchToNextChunk(textSourceId: string, chunkId?: number) {
    if (!this.props.marked.length && this.props.words.length)
      if (!confirm("Nothing saved from this chunk!")) return;

    this.chunkRetriever.getNextChunk(textSourceId, chunkId).then(
      chunk => {
        this.props.setText(chunk.text, chunk.newId, textSourceId);
        this.setState({ sources: this.chunkRetriever.getOptions() });
      },
      fail => alert("Error fetching chunk from server: " + fail)
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
      textClickStrategy: new ContextSelector(
        store.dispatch,
        this.props.words.length
      ),
      isSelectingContext: true
    });
  }

  setTextSource(id: string) {
    if (
      !_.isUndefined(this.state.textSourceId) &&
      this.state.textSourceId === id
    )
      return;

    this.setState({ textSourceId: id });
    this.switchToNextChunk(id, this.props.textSourcePositions[id]);
  }

  addTextSource(id: string, text: string) {
    this.chunkRetriever.addTextSource(id, text);
    this.setState({
      sources: this.chunkRetriever.getOptions(),
      textSourceId: id
    });
  }

  render() {
    const contextString =
      this.props.contextBoundaries &&
      (({ start, length }) =>
        this.props.words
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
          addTextSource={this.addTextSource}
        />
        {_.isUndefined(this.state.textSourceId) ? null : (
          <div className="App">
            <h3>Choose words to check meaning:</h3>

            <TextEditor
              tabIndex={0}
              emptyText="Loading text..."
              clickStrategy={this.state.textClickStrategy}
              className={this.state.isSelectingContext ? "selectContext" : ""}
            />

            <h3>Marked unknown:</h3>
            <UnknownWordsList.View words={this.state.marked} tabIndex={0} />

            <CardEditor
              usedHints={this.props.editedMarked}
              contextString={contextString}
              provideWordSelectControls={this.provideWordSelectControls}
              provideContextSelectControls={this.provideContextSelectControls}
              isSelectingContext={this.state.isSelectingContext}
              switchToNextChunk={this.switchToNextChunk.bind(
                this,
                this.state.textSourceId
              )}
              words={this.state.marked}
              onSave={this.props.onCardSave}
              chunkId={this.props.textSourcePositions[this.state.textSourceId]}
              textSourceId={this.state.textSourceId}
              dictionary={Dictionary}
            />
            <>{JSON.stringify(this.props.savedWords)}</>
            <>{JSON.stringify(this.props.savedChunks)}</>

            <button className="anchor block" onClick={this.generateCsvFile}>
              Generate a <kbd>csv</kbd> file for anki
            </button>
          </div>
        )}
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

  textSourcePositions: CachedPositions;
}

interface AppDispatchProps {
  onCardSave: (obj: SavedWord, chunkId: number, textSourceId: string) => void;
  setText: (text: string, chunkId: number, textSourceId: string) => void;
}

const mapStateToProps = ({
  wordState: { words, savedWords, marked, editedMarked, contextBoundaries },
  textSourcePositions,
  savedChunks
}: State): AppStateProps => ({
  words,
  savedWords,
  marked,
  editedMarked,
  contextBoundaries,
  textSourcePositions,
  savedChunks
});

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): AppDispatchProps => ({
  onCardSave(obj: SavedWord, chunkId: number, textSourceId: string) {
    dispatch({ type: "SAVE_WORD", obj, chunkId, textSourceId });
  },
  setText(text: string, chunkId: number, textSourceId: string) {
    dispatch({ type: "SET_TEXT", text, chunkId, textSourceId });
  }
});

const App = connect<AppStateProps, AppDispatchProps, void>(
  mapStateToProps,
  mapDispatchToProps
)(AppClass);
export default App;
