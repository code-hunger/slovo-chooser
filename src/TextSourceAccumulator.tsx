import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { flatMap, values } from "lodash";
import reactbind from "react-bind-decorator";

import TextEditor from "./TextEditor";
import CardEditor from "./CardEditor";
import UnknownWordList from "./UnknownWordsList";
import { NumberedWord } from "./Word";
import Dictionary from "./Dictionary";
import store, { State, WordAction, SavedChunks, SavedWord } from "./store";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "./TextClickStrategies";
import exportToCsv from "./exportToCSV";

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

interface MyState {}

@reactbind()
class TextSourceAccumulator extends React.Component<Props, MyState> {
  generateCsvFile() {
    const csvArray = flatMap(this.props.savedChunks).map(values);
    exportToCsv("anki_export.csv", csvArray);
  }

  render() {
    return (
      <>
        <h3>Choose words to check meaning:</h3>
        <TextEditor
          tabIndex={0}
          emptyText="Loading text..."
          clickStrategy={this.props.textClickStrategy}
          className={this.props.isSelectingContext ? "selectContext" : ""}
        />
        <h3>Marked unknown:</h3>
        <UnknownWordList tabIndex={0} />
        <CardEditor
          isSelectingContext={this.props.isSelectingContext}
          switchToNextChunk={this.props.onReady}
          onSave={this.props.onCardSave}
          textSourceId={this.props.textSourceId}
          dictionary={Dictionary}
        />
        {this.props.savedChunks ? (
          <button className="anchor block" onClick={this.generateCsvFile}>
            Generate a <kbd>csv</kbd> file for anki
          </button>
        ) : null}
      </>
    );
  }
}

export default connect<
  PropsFromState,
  PropsFromDispatch,
  PropsFromOutside,
  State
>(mapStateToProps, mapDispatchToProps)(TextSourceAccumulator);
