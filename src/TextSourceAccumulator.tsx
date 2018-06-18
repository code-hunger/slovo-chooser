import * as React from "react";
import { connect, Dispatch } from "react-redux";
import { flatMap, values } from "lodash";

import TextEditor from "./TextEditor";
import CardEditor from "./CardEditor";
import * as UnknownWordsList from "./UnknownWordsList";
import { NumberedWord } from "./Word";
import Dictionary from "./Dictionary";
import store, { State, WordAction, SavedChunks, SavedWord } from "./store";
import {
  ContextSelector,
  UnknownWordSelector,
  TextClickStrategy
} from "./TextClickStrategies";
import exportToCsv from "./exportToCSV";

const ConnectedUnknownWordList = connect<
  { words: NumberedWord[] },
  void,
  { tabIndex?: number },
  State
>(({ cardState, words }) => ({
  words: cardState.words.marked.map((wordId, i) => ({
    ...words[wordId],
    index: i
  }))
}))(UnknownWordsList.View);

type Props = PropsFromState & PropsFromDispatch & PropsFromOutside;

interface PropsFromOutside {
  textSourceId: string;
  onReady: () => void;
}

interface PropsFromState {
  words: NumberedWord[];
  savedChunks: SavedChunks;
}

interface PropsFromDispatch {
  onCardSave: (obj: SavedWord, chunkId: number, textSourceId: string) => void;
}

const mapStateToProps = ({ words, savedChunks }: State): PropsFromState => ({
  words,
  savedChunks
});

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): PropsFromDispatch => ({
  onCardSave(obj: SavedWord, chunkId: number, textSourceId: string) {
    dispatch({ type: "SAVE_WORD", obj, chunkId, textSourceId });
  }
});

interface MyState {
  textClickStrategy: TextClickStrategy;
  isSelectingContext: boolean;
}

class TextSourceAccumulator extends React.Component<Props, MyState> {
  state = {
    textClickStrategy: UnknownWordSelector(store.dispatch),
    isSelectingContext: false
  };

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
          clickStrategy={this.state.textClickStrategy}
          className={this.state.isSelectingContext ? "selectContext" : ""}
        />
        <h3>Marked unknown:</h3>
        <ConnectedUnknownWordList tabIndex={0} />
        <CardEditor
          provideWordSelectControls={this.provideWordSelectControls}
          provideContextSelectControls={this.provideContextSelectControls}
          isSelectingContext={this.state.isSelectingContext}
          switchToNextChunk={this.props.onReady}
          onSave={this.props.onCardSave}
          textSourceId={this.props.textSourceId}
          dictionary={Dictionary}
        />
        <button className="anchor block" onClick={this.generateCsvFile}>
          Generate a <kbd>csv</kbd> file for anki
        </button>
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
