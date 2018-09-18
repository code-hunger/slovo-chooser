import * as React from "react";
import { find, isUndefined } from "lodash";
import reactbind from "react-bind-decorator";
import "./App.css";

import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import * as PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { WithStyles, Theme } from "@material-ui/core";

import ChunkRetriever, { CachedPositions } from "../ChunkRetriever";

import TextAdder from "./TextAdder";
import TextSourceChooser from "./TextSourceChooser";
import { NumberedWord } from "../Word";
import TextSourceAccumulator from "./TextSourceAccumulator";
import SavedWordsContainer from "../SavedWordsContainer";

import { LocalTextSource } from "../store";

import { Closud } from "shadow-cljs/project.entry"

type Props = AppProps & WithStyles<typeof styles>;

interface AppProps {
  textSourcePositions: CachedPositions;
  localTextSources: LocalTextSource[];

  setText: (text: string, chunkId: number, textSourceId: string) => void;
  textSourceRemover: (source: LocalTextSource) => void;
}

interface State {
  textSourceId?: string;
  sources: { id: string; description: string; chunkId: number }[];
}

@reactbind()
class AppClass extends React.Component<Props, State> {
  private chunkRetriever: ChunkRetriever;

  constructor(props: Props) {
    super(props);

    this.chunkRetriever = new ChunkRetriever(props.textSourcePositions);
    this.chunkRetriever.getOptionsFromServer().then(sources => {
      this.setState({ sources });
      this.setTextSource(sources[0].id);
    });

    this.importLocalSources(props.localTextSources);

    this.state = {
      textSourceId: undefined,
      sources: this.chunkRetriever.getOptions()
    };
  }

  importLocalSources(localTextSources: LocalTextSource[]) {
    localTextSources.forEach(textSource =>
      this.chunkRetriever.addTextSource(textSource.id, textSource.text)
    );
  }

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.localTextSources !== this.props.localTextSources) {
      this.importLocalSources(nextProps.localTextSources);
      this.setState({ sources: this.chunkRetriever.getOptions() });
    }
  }

  switchToNextChunk(
    chunkId?: number,
    textSourceId: string | undefined = this.state.textSourceId
  ) {
    if (isUndefined(textSourceId)) throw "No text source";

    return this.chunkRetriever.getNextChunk(textSourceId, chunkId).then(
      chunk => {
        this.props.setText(chunk.text, chunk.newId, textSourceId);
        this.setState({
          sources: this.chunkRetriever.getOptions(),
          textSourceId
        });
      },
      fail => alert("Error fetching chunk from server: " + fail)
    );
  }

  setTextSource(id: string) {
    if (this.state.textSourceId === id) return;

    this.switchToNextChunk(this.props.textSourcePositions[id], id);
  }

  removeTextSource(id: string) {
    // The text source string id needs to be converted to the numeric id of the source in props.localSources
    const localTextSourceId = find(this.props.localTextSources, ["id", id]);
    return isUndefined(localTextSourceId)
      ? false
      : () => {
          this.chunkRetriever.removeTextSource(id);
          this.setState({ sources: this.chunkRetriever.getOptions() });
          this.props.textSourceRemover(localTextSourceId);
        };
  }

  switchChunk(direction: 1 | -1) {
    if (isUndefined(this.state.textSourceId))
      throw "Tried to switch chunk without text source";

    this.switchToNextChunk(
      this.props.textSourcePositions[this.state.textSourceId] + direction
    );
  }

  render() {
    const classes = this.props.classes;
    const textSourceId = this.state.textSourceId;
    const hasTextSource = !isUndefined(textSourceId);
    return (
      <Grid container spacing={16} className={classes.root} justify="center">
        <Grid
          item
          lg={hasTextSource ? 3 : 4}
          md={hasTextSource ? 4 : 6}
          sm={hasTextSource ? 12 : 8}
          xs={12}
        >
          <Paper className={classes.paper}>
            <TextSourceChooser
              textSources={this.state.sources}
              setTextSource={this.setTextSource}
              currentSourceId={textSourceId}
              removeTextSource={this.removeTextSource}
            />
            <TextAdder />
          </Paper>
        </Grid>
        {isUndefined(textSourceId) ? null : (
          <Grid item lg={6} md={8} xs={12}>
            <TextSourceAccumulator
              switchChunk={this.switchChunk}
              textSourceId={textSourceId}
            />
          </Grid>
        )}
        <Grid item lg={3} xs={12}>
          <Paper className={classes.paper}>
            <SavedWordsContainer textSourceId={textSourceId} />
            <Closud />
          </Paper>
        </Grid>
      </Grid>
    );
  }
}

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit
  },
  paper: {
    padding: theme.spacing.unit * 2
  }
});

export default withStyles(styles)(AppClass);
