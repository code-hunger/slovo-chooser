import * as React from "react";
import { find, isUndefined, get as getPath, mapKeys } from "lodash";
import "./App.css";

import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import * as PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { WithStyles, Theme } from "@material-ui/core";

import ChunkRetriever, {
  CachedPositions,
  getOptions,
  fetchSourcesFromServer
} from "../ChunkRetriever";

import TextAdder from "./TextAdder";
import TextSourceChooser, { TextSource } from "./TextSourceChooser";
import { NumberedWord } from "../Word";
import TextSourceAccumulator from "./TextSourceAccumulator";
import SavedWordsContainer from "../SavedWordsContainer";

import { LocalTextSource } from "../store";

type Props = AppProps & WithStyles<typeof styles>;

interface AppProps {
  textSourcePositions: CachedPositions;
  localTextSources: LocalTextSource[];

  setText: (text: string, chunkId: number, textSourceId: string) => void;
  textSourceRemover: (source: LocalTextSource) => void;
}

interface State {
  textSourceId?: string;
  sources: TextSource<string>[];
}

class AppClass extends React.Component<Props, State> {
  private chunkRetriever: ChunkRetriever;

  constructor(props: Props) {
    super(props);

    this.chunkRetriever = new ChunkRetriever();

    fetchSourcesFromServer(props.textSourcePositions)
      .then(remoteSources => {
        Object.assign(this.chunkRetriever.sources, mapKeys(remoteSources, "id"));
        return getOptions(this.chunkRetriever.sources);
      })
      .then(sources => {
        this.setState({ sources });
        return sources;
      })
      .catch(() => this.props.localTextSources)
      .then(sources => {
        const textSourceId: string = getPath(sources, "[0].id");
        if (textSourceId) this.setTextSource(textSourceId);
      });

    this.importLocalSources(props.localTextSources);

    this.state = {
      textSourceId: undefined,
      sources: getOptions(this.chunkRetriever.sources)
    };
  }

  importLocalSources = (localTextSources: LocalTextSource[]) => {
    localTextSources.forEach(textSource =>
      this.chunkRetriever.addTextSource(
        textSource.id,
        textSource.chunks,
        this.props.textSourcePositions[textSource.id]
      )
    );
  };

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.localTextSources !== this.props.localTextSources) {
      this.importLocalSources(nextProps.localTextSources);
      this.setState({
        sources: getOptions(this.chunkRetriever.sources)
      });
    }
  }

  switchToNextChunk = (
    chunkId: number,
    textSourceId: string | undefined = this.state.textSourceId
  ) => {
    if (isUndefined(textSourceId)) throw "No text source";

    return this.chunkRetriever.getNextChunk(textSourceId, chunkId).then(
      chunk => {
        this.props.setText(chunk.text, chunk.newId, textSourceId);
        this.setState({
          sources: getOptions(this.chunkRetriever.sources),
          textSourceId
        });
      },
      fail => alert("Error fetching chunk from server: " + fail)
    );
  };

  setTextSource = (id: string) => {
    if (this.state.textSourceId === id) return;

    this.switchToNextChunk(this.props.textSourcePositions[id], id);
  };

  removeTextSource = (id: string) => {
    // The text source string id needs to be converted to the numeric id of the source in props.localSources
    const localTextSourceId = find(this.props.localTextSources, ["id", id]);
    return isUndefined(localTextSourceId)
      ? false
      : () => {
          this.chunkRetriever.removeTextSource(id);
          this.setState({ sources: getOptions(this.chunkRetriever.sources) });
          this.props.textSourceRemover(localTextSourceId);
        };
  };

  switchChunk = (direction: 1 | -1) => {
    if (isUndefined(this.state.textSourceId))
      throw "Tried to switch chunk without text source";

    this.switchToNextChunk(
      this.props.textSourcePositions[this.state.textSourceId] + direction
    );
  };

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
            <TextAdder autoOpen={this.state.sources.length < 1} />
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
            <SavedWordsContainer textSourceId={textSourceId} maxRows={10} />
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
