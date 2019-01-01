import * as React from "react";

import Grid from "@material-ui/core/Grid";
import * as PropTypes from "prop-types";
import { WithStyles, Theme } from "@material-ui/core";
import withStyles from "@material-ui/core/styles/withStyles";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

import TextWord from "./EnhancedTextWord";
import { TextEditor } from "shadow-cljs/project.TextEditor";
import CardEditor from "./CardEditor";
import UnknownWordList from "./UnknownWordsList";
import { NumberedWord } from "../Word";
import Dictionary from "./Dictionary";
import DownloadButton from "./DownloadSaved";
import { SavedWord } from "../store";

import { TextClickStrategy, UnknownWordSelector } from "../TextClickStrategies";
import { CachedPositions } from "src/ChunkRetriever";

interface Props {
  textSourceId: string;
  textSourcePositions: CachedPositions;
  switchChunk: (direction: 1 | -1) => void;

  words: NumberedWord[];

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
  onWordClick = id => this.props.onWordClick(UnknownWordSelector, id);
  onContextMenu = id => this.props.onContextMenu(UnknownWordSelector, id);
  onCardSave = (obj: SavedWord, chunkId: number) =>
    this.props.onCardSave(obj, chunkId, this.props.textSourceId);

  render() {
    return (
      <Grid container justify="center" spacing={8}>
        <Grid item lg={8} xs={12}>
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
              words={this.props.words}
              wordType={TextWord}
            />
          </Paper>
        </Grid>
        <Grid item lg={4} xs={12}>
          <Paper className={this.props.classes.fullHeight}>
            <Typography variant="headline">Marked unknown:</Typography>
            <UnknownWordList tabIndex={0} />
          </Paper>
        </Grid>
        <Grid item xs={12}>
          <Paper className={this.props.classes.paper}>
            <CardEditor
              switchChunk={this.props.switchChunk}
              onSave={this.onCardSave}
              chunkId={this.props.textSourcePositions[this.props.textSourceId]}
              dictionary={Dictionary}
            />
          </Paper>
        </Grid>
        <DownloadButton textSourceId={this.props.textSourceId} />
      </Grid>
    );
  }
}

export default withStyles(styles)(TextSourceAccumulator);
