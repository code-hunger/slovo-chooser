import * as React from "react";
import "./App.css";

import axios from "axios";

import TextEditor from "./TextEditor";
import { CardEditor } from "./CardEditor";
import * as UnknownWordsList from "./UnknownWordsList";
import { Word, NumberedWordView, NumberedWord, Clickable } from "./Word";
import { TextClickStrategy } from "./TextClickStrategies";

import exportToCsv from "./exportToCSV";

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

type CSVRow = string[];
type CSVRows = CSVRow[];

class AppClass extends React.Component<AppProps> {
  constructor(props: AppProps) {
    super(props);

    this.generateCsvFile = this.generateCsvFile.bind(this);
    (this.switchToNextChunk = this.switchToNextChunk.bind(this))(props.chunkId);
  }

  switchToNextChunk(chunk: number = this.props.chunkId + 1) {
    if (!this.props.marked.length && this.props.words.length)
      if (!confirm("Nothing saved from this chunk!")) return;

    axios
      .get("/text", {
        params: { chunk },
        responseType: "json"
      })
      .then(({ data: { text, chunkId } }) =>
        this.props.setText(text || (alert("No text from server"), ""), chunkId)
      );
  }

  generateCsvFile() {
    const csvArray = _.flatMap(this.props.savedChunks).map(_.values);
    exportToCsv("anki_export.csv", csvArray);
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
            clickStrategy={this.props.textClickStrategy}
          />

          <h3>Marked unknown:</h3>
          <UnknownWordsList.View words={marked} tabIndex={0} />

          <CardEditor
            selectedUnknown={selectedUnknown}
            notSelectedUnknown={notSelectedUnknown}
            contextString={contextString}
            clickStrategy={this.props.textClickStrategy}
            switchToNextChunk={this.switchToNextChunk}
            words={marked}
            onSave={this.props.onCardSave}
            chunkId={this.props.chunkId}
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
  textClickStrategy: TextClickStrategy;

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
  },
  textClickStrategy
}): AppStateProps => ({
  words,
  savedWords,
  marked,
  editedMarked,
  contextBoundaries,
  textClickStrategy,
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
