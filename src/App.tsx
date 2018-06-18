import * as React from "react";
import "./App.css";

import TextSourceAccumulator from "./TextSourceAccumulator";
import TextSourceChooser from "./TextSourceChooser";
import { NumberedWord } from "./Word";

import Grid from "@material-ui/core/Grid";
import { withStyles } from "@material-ui/core/styles";
import * as PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { WithStyles, Theme } from "@material-ui/core";

import ChunkRetriever, { CachedPositions } from "./ChunkRetriever";

import store, { State, WordAction, SavedWord } from "./store";

import reactbind from "react-bind-decorator";
import { connect, Dispatch } from "react-redux";
import * as _ from "lodash";

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

    this.chunkRetriever = new ChunkRetriever(this.props.textSourcePositions);
    this.chunkRetriever
      .getOptionsFromServer()
      .then(sources => this.setState({ sources }));

    this.state = {
      textSourceId: undefined,
      sources: this.chunkRetriever.getOptions()
    };
  }

  switchToNextChunk(chunkId?: number) {
    const textSourceId = this.state.textSourceId;

    if (_.isUndefined(textSourceId)) throw "No text source";

    this.chunkRetriever.getNextChunk(textSourceId, chunkId).then(
      chunk => {
        this.props.setText(chunk.text, chunk.newId, textSourceId);
        this.setState({ sources: this.chunkRetriever.getOptions() });
      },
      fail => alert("Error fetching chunk from server: " + fail)
    );
  }

  setTextSource(id: string) {
    if (this.state.textSourceId === id) return;

    this.setState({ textSourceId: id }, () =>
      this.switchToNextChunk(this.props.textSourcePositions[id])
    );
  }

  addTextSource(id: string, text: string) {
    this.chunkRetriever.addTextSource(id, text);
    this.setState({
      sources: this.chunkRetriever.getOptions(),
      textSourceId: id
    });
  }

  render() {
    const classes = this.props.classes;
    return (
      <Grid
        container
        spacing={16}
        className={classes.root}
        justify="space-around"
      >
        <Grid item md={4} xs={12}>
          <Paper className={classes.paper}>
            <TextSourceChooser
              textSources={this.state.sources}
              setTextSource={this.setTextSource}
              currentSourceId={this.state.textSourceId}
              addTextSource={this.addTextSource}
            />
          </Paper>
        </Grid>
        <Grid item md={8} xs={12}>
          {_.isUndefined(this.state.textSourceId) ? (
            "Text source not chosen"
          ) : (
            <Paper className={classes.paper}>
              <TextSourceAccumulator
                onReady={this.switchToNextChunk}
                textSourceId={this.state.textSourceId}
              />
            </Paper>
          )}
        </Grid>
      </Grid>
    );
  }
}

interface AppStateProps {
  textSourcePositions: CachedPositions;
}

interface AppDispatchProps {
  setText: (text: string, chunkId: number, textSourceId: string) => void;
}

const mapStateToProps = (state: State): AppStateProps =>
  _.pick(state, ["textSourcePositions"]);

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): AppDispatchProps => ({
  setText(text: string, chunkId: number, textSourceId: string) {
    dispatch({ type: "SET_TEXT", text, chunkId, textSourceId });
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
