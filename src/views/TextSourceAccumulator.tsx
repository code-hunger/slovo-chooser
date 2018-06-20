import * as React from "react";
import { flatMap, values } from "lodash";
import reactbind from "react-bind-decorator";

import TextEditor from "../containers/TextEditor";
import CardEditor from "../containers/CardEditor";
import UnknownWordList from "../containers/UnknownWordsList";
import { NumberedWord } from "../views/Word";
import Dictionary from "../containers/Dictionary";
import { SavedChunks, SavedWord } from "../store";

import { TextClickStrategy } from "../TextClickStrategies";
import exportToCsv from "../exportToCSV";

interface Props {
  textSourceId: string;
  onReady: () => void;

  words: NumberedWord[];
  savedChunks: { [chunkId: number]: SavedWord[] };
  textClickStrategy: TextClickStrategy;
  isSelectingContext: boolean;

  onCardSave: (obj: SavedWord, chunkId: number, textSourceId: string) => void;
}

@reactbind()
export default class TextSourceAccumulator extends React.Component<Props> {
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
