import * as React from "react";
import { flatMap, values } from "lodash";
import reactbind from "react-bind-decorator";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";

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
        <Typography variant="headline">Choose words to check meaning:</Typography>
        <TextEditor
          tabIndex={0}
          emptyText="Loading text..."
          clickStrategy={this.props.textClickStrategy}
          className={this.props.isSelectingContext ? "selectContext" : ""}
        />
        <Typography variant="headline">Marked unknown:</Typography>
        <UnknownWordList tabIndex={0} />
        <CardEditor
          isSelectingContext={this.props.isSelectingContext}
          switchToNextChunk={this.props.onReady}
          onSave={this.props.onCardSave}
          textSourceId={this.props.textSourceId}
          dictionary={Dictionary}
        />
        {this.props.savedChunks ? (
          <Button variant="contained" className="anchor block" onClick={this.generateCsvFile}>
            Generate a <kbd>csv</kbd> file for anki
          </Button>
        ) : null}
      </>
    );
  }
}
