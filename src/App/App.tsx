import * as React from "react";
import { find, isUndefined, get as getPath, mapKeys, values } from "lodash";
import update from "immutability-helper";
import { Maybe } from "monet";
import "./App.css";

import * as R from "ramda";

import S from "sanctuary";
import $ from "sanctuary-def";
import SMaybe from "sanctuary-maybe";

import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import * as PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { WithStyles, Theme } from "@material-ui/core";

import {
  CachedPositions,
  fetchSourcesFromServer,
  createTextSource,
  getNextChunk
} from "../ChunkRetriever";

import TextAdder from "./TextAdder";
import TextSourceChooser, { TextSource } from "./TextSourceChooser";
import { NumberedWord } from "../Word";
import TextSourceAccumulator from "./TextSourceAccumulator";
import SavedWordsContainer from "../SavedWordsContainer";

import { PersistedTextSource, LocalTextSource } from "../store";

type Props = AppProps & WithStyles<typeof styles>;

interface AppProps {
  textSourcePositions: CachedPositions;
  localTextSources: LocalTextSource[];

  setText: (text: string, chunkId: number, textSourceId: string) => void;
  textSourceRemover: (source: LocalTextSource) => void;
}

interface State {
  textSourceId?: string;
  sources: Map<string, PersistedTextSource>;
}

class AppClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    fetchSourcesFromServer(props.textSourcePositions)
      .then((remoteSources: PersistedTextSource[]) => {
        this.setState(
          update(this.state, {
            sources: {
              $add: remoteSources.map(source => [source.id, source]) as [
                string,
                PersistedTextSource
              ][]
            }
          })
        );
        return remoteSources;
      })
      .catch(() => this.props.localTextSources)
      .then(sources => {
        const textSourceId: string = getPath(sources, "[0].id");
        if (textSourceId) this.setTextSource(textSourceId);
      });

    this.state = {
      textSourceId: undefined,
      sources: new Map(this.importLocalSources(props.localTextSources))
    };
  }

  importLocalSources = (localTextSources: LocalTextSource[]) =>
    localTextSources
      .map(({ id, chunks }) =>
        createTextSource(id, chunks, this.props.textSourcePositions[id])
      )
      .map(source => [source.id, source]) as [string, PersistedTextSource][];

  componentWillReceiveProps(nextProps: AppProps) {
    if (nextProps.localTextSources !== this.props.localTextSources) {
      this.setState(
        update(this.state, {
          sources: { $add: this.importLocalSources(nextProps.localTextSources) }
        })
      );
    }
  }

  getTextSource = (id?: string) =>
    Maybe.fromNull(id)
      .orElse(Maybe.fromNull(this.state.textSourceId))
      .chain(id => Maybe.fromNull(this.state.sources.get(id)));

  switchToNextChunk = (chunkId: number, textSourceId?: string) =>
    this.getTextSource(textSourceId)
      .map(R.partial(R.flip(getNextChunk), [chunkId]))
      .map(
        R.then(([source, chunk]) =>
          this.switchToChunk(source.id, chunk.newId, chunk.text)
        )
      )
      .map(
        R.otherwise(fail => alert("Error fetching chunk from server: " + fail))
      );

  setTextSource = (id: string) => {
    if (this.state.textSourceId === id) return;

    this.switchToNextChunk(this.props.textSourcePositions[id] || 1, id);
  };

  switchToChunk = (sourceId: string, newId: number, text: string) => {
    this.props.setText(text, newId, sourceId);
    this.setState({
      textSourceId: sourceId,
      sources: update(this.state.sources as any, {
        [sourceId]: {
          chunkId: { $set: newId }
        }
      })
    });
  };

  removeTextSource = (id: string) => {
    // The text source string id needs to be converted to the numeric id of the source in props.localSources
    const localTextSourceId = find(this.props.localTextSources, ["id", id]);
    return isUndefined(localTextSourceId)
      ? false
      : () => {
          this.setState(update(this.state, { sources: { $remove: [id] } }));
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
            <TextAdder autoOpen={this.state.sources.size < 1} />
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
