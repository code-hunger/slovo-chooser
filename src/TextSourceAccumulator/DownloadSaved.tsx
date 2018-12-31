import * as React from "react";

import { flatMap, values } from "lodash";

import Grid from "@material-ui/core/Grid";
import Button from "@material-ui/core/Button";

import exportToCsv from "../exportToCSV";
import { SavedChunks, SavedWord, State } from "../store";
import { connect } from "react-redux";

interface PropsFromState {
  savedChunks: { [chunkId: number]: SavedWord[] };
}

interface PropsFromOutside {
  textSourceId: string;
}

class DownloadButton extends React.Component<
  PropsFromState & PropsFromOutside
> {
  generateCsvFile = () => {
    const csvArray = flatMap(this.props.savedChunks).map(values);
    exportToCsv(this.props.textSourceId + ".csv", csvArray);
  };

  render() {
    return (
      <Grid item>
        <Button variant="contained" onClick={this.generateCsvFile} fullWidth>
          Generate a <kbd>csv</kbd> file for anki
        </Button>
      </Grid>
    );
  }
}

export default connect<PropsFromState, void, PropsFromOutside, State>(
  (state, { textSourceId }) => ({
    savedChunks: state.savedChunks[textSourceId]
  })
)(DownloadButton);
