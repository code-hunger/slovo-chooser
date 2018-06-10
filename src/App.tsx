import * as React from "react";
import "./App.css";

import TextEditor from "./TextEditor";
import { CardEditor } from "./CardEditor";
import * as UnknownWordsList from "./UnknownWordsList";
import Dictionary from "./Dictionary";
import { Word, NumberedWordView, NumberedWord, Clickable } from "./Word";
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
  SavedWord,
  SavedWords
} from "./store";

import { connect, Dispatch } from "react-redux";
import * as _ from "lodash";

type AppProps = AppStateProps & AppDispatchProps;

function insideBoundaries(contextBoundaries: ContextBoundaries, index: number) {
  let start = contextBoundaries.start,
    end = start + contextBoundaries.length;
  return index >= start && index <= end;
}

const mapStateToTextWordProps = (
  { wordState: { words, contextBoundaries, savedWords } }: State,
  { index }: NumberedWord
): Word => ({
  word: words[index].word,
  classNames: [
    ...words[index].classNames,
    ...(contextBoundaries && insideBoundaries(contextBoundaries, index)
      ? ["boundary"]
      : []),
    ...(savedWords.indexOf(words[index].word) > -1 ? ["fade-word"] : [])
  ]
});

const TextWord = connect<Word, null, { index: number }>(
  mapStateToTextWordProps
)(NumberedWordView);

interface AppState {
  textClickStrategy: TextClickStrategy;
  isSelectingContext: boolean;
}

class AppClass extends React.Component<AppProps, AppState> {
  private chunkRetriever: ChunkRetriever;

  constructor(props: AppProps) {
    super(props);

    this.chunkRetriever = new ChunkRetriever(props.chunkId);
    this.generateCsvFile = this.generateCsvFile.bind(this);
    (this.switchToNextChunk = this.switchToNextChunk.bind(this))(props.chunkId);

    this.provideWordSelectControls = this.provideWordSelectControls.bind(this);
    this.provideContextSelectControls = this.provideContextSelectControls.bind(
      this
    );

    this.state = {
      textClickStrategy: UnknownWordSelector(store.dispatch),
      isSelectingContext: false
    };
  }

  switchToNextChunk() {
    if (!this.props.marked.length && this.props.words.length)
      if (!confirm("Nothing saved from this chunk!")) return;

    this.chunkRetriever
      .getNextChunk()
      .then(({ data: { text, chunkId } }) =>
        this.props.setText(text || (alert("No text from server"), ""), chunkId)
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
        <div className="App">
          <h3>Choose words to check meaning:</h3>

          <TextEditor
            tabIndex={0}
            emptyText="Loading text..."
            wordType={TextWord}
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
            switchToNextChunk={this.switchToNextChunk}
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
  savedWords: any[];
  savedChunks: SavedChunks;
  marked: number[];
  editedMarked: number[];
  contextBoundaries: ContextBoundaries;

  chunkId: number;
}

interface AppDispatchProps {
  onCardSave: (obj: any) => void;
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
  onCardSave(obj: any) {
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
