import * as React from "react";
import { flatMap, values } from "lodash";

import Grid from "@material-ui/core/Grid";
import * as PropTypes from "prop-types";
import { WithStyles, Theme } from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";

import TextEditor from "./TextEditor";
import CardEditor from "./CardEditor";
import UnknownWordList from "./UnknownWordsList";
import { NumberedWord } from "../Word";
import Dictionary from "./Dictionary";
import { SavedChunks, SavedWord } from "../store";

import { TextClickStrategy, UnknownWordSelector } from "../TextClickStrategies";
import exportToCsv from "../exportToCSV";

interface Props {
  textSourceId: string;
  switchChunk: (direction: 1 | -1) => void;

  words: NumberedWord[];
  savedChunks: { [chunkId: number]: SavedWord[] };

  onWordClick: (strategy: TextClickStrategy, id: number) => void;
  onContextMenu: (strategy: TextClickStrategy, word: number) => void;

  isSelectingContext: boolean;

  onCardSave: (obj: SavedWord, chunkId: number, textSourceId: string) => void;
}

const styles = (theme: Theme) => ({
  paper: {
    padding: theme.spacing.unit * 2,
    marginTop: theme.spacing.unit * 2
  },
  fullHeight: {
    padding: theme.spacing.unit * 2,
    paddingBottom: 0,
    [theme.breakpoints.up("sm")]: {
      height: "100%"
    }
  }
});

type StyledProps = Props & WithStyles<typeof styles>;

class TextSourceAccumulator extends React.Component<StyledProps> {
  generateCsvFile = () => {
    const csvArray = flatMap(this.props.savedChunks).map(values);
    exportToCsv(this.props.textSourceId + ".csv", csvArray);
  };

  onWordClick = id => this.props.onWordClick(UnknownWordSelector, id);
  onContextMenu = id => this.props.onContextMenu(UnknownWordSelector, id);

  render() {
    return (
      <Grid container={true} justify="center" spacing={8}>
        <Grid item={true} sm={8} xs={12}>
          <Paper className={this.props.classes.fullHeight}>
            <Typography variant="headline">
              Choose words to check meaning:
            </Typography>
            <TextEditor
              tabIndex={0}
              emptyText="Loading text..."
              onWordClick={this.onWordClick}
              onContextMenu={this.onContextMenu}
              className={this.props.isSelectingContext ? "selectContext" : ""}
            />
          </Paper>
        </Grid>
        <Grid item={true} sm={4} xs={12}>
          <Paper className={this.props.classes.fullHeight}>
            <Typography variant="headline">Marked unknown:</Typography>
            <UnknownWordList tabIndex={0} />
          </Paper>
        </Grid>
        <Grid item={true} xs={12}>
          <Paper className={this.props.classes.paper}>
            <CardEditor
              switchChunk={this.props.switchChunk}
              onSave={this.props.onCardSave}
              textSourceId={this.props.textSourceId}
              dictionary={Dictionary}
            />
          </Paper>
        </Grid>
        {this.props.savedChunks ? (
          <Grid item={true}>
            <Button
              variant="contained"
              onClick={this.generateCsvFile}
              fullWidth={true}
            >
              Generate a <kbd>csv</kbd> file for anki
            </Button>
          </Grid>
        ) : null}
      </Grid>
    );
  }
}

export default withStyles(styles)(TextSourceAccumulator);
