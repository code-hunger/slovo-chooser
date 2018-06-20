import * as React from "react";
import "../App.css";

import TextSourceAccumulator from "./TextSourceAccumulator";
import TextSourceChooser from "../views/TextSourceChooser";
import { NumberedWord } from "../views/Word";
import TextAdder from "./TextAdder";

import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import * as PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { WithStyles, Theme } from "@material-ui/core";

import ChunkRetriever, { CachedPositions } from "../ChunkRetriever";

import store, { State, WordAction, SavedWord, LocalTextSource } from "../store";

import reactbind from "react-bind-decorator";
import { connect, Dispatch } from "react-redux";
import { pick, find, findIndex, isUndefined } from "lodash";

type AppProps = AppStateProps & AppDispatchProps & WithStyles<typeof styles>;

interface AppState {
  textSourceId?: string;
  sources: { id: string; description: string; chunkId: number }[];
}

@reactbind()
class AppClass extends React.Component<AppProps, AppState> {
  private chunkRetriever: ChunkRetriever;

  constructor(props: AppProps) {
    super(props);

    this.chunkRetriever = new ChunkRetriever(props.textSourcePositions);
    this.chunkRetriever
      .getOptionsFromServer()
      .then(sources => this.setState({ sources }));

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

  render() {
    const classes = this.props.classes;
    const textSourceId = this.state.textSourceId;
    const hasTextSource = !isUndefined(textSourceId);
    return (
      <Grid
        container
        spacing={16}
        className={classes.root}
        justify="space-around"
      >
        <Grid
          item
          lg={4}
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
          <Grid item md={8} xs={12}>
            <Paper className={classes.paper}>
              <TextSourceAccumulator
                onReady={this.switchToNextChunk}
                textSourceId={textSourceId}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  }
}

interface AppStateProps {
  textSourcePositions: CachedPositions;
  localTextSources: LocalTextSource[];
}

interface AppDispatchProps {
  setText: (text: string, chunkId: number, textSourceId: string) => void;
  textSourceRemover: (source: LocalTextSource) => void;
}

const mapStateToProps = (state: State): AppStateProps =>
  pick(state, ["textSourcePositions", "localTextSources"]);

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): AppDispatchProps => ({
  setText(text: string, chunkId: number, textSourceId: string) {
    dispatch({ type: "SET_TEXT", text, chunkId, textSourceId });
  },
  textSourceRemover(sourceIndex: LocalTextSource) {
    dispatch({ type: "REMOVE_LOCAL_TEXT_SOURCE", sourceIndex });
  }
});

const styles = (theme: Theme) => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing.unit
  },
  paper: {
    padding: theme.spacing.unit * 2
  }
});
const styled = withStyles(styles)(AppClass);

const App = connect<AppStateProps, AppDispatchProps, void>(
  mapStateToProps,
  mapDispatchToProps
)(styled);
export default App;
