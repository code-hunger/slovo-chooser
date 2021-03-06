import * as React from "react";
import { find, isUndefined, get as getPath } from "lodash";
import update from "immutability-helper";
import { Maybe } from "monet";
import "./App.css";

import Grid from "@material-ui/core/Grid";
import withStyles from "@material-ui/core/styles/withStyles";
import * as PropTypes from "prop-types";
import Paper from "@material-ui/core/Paper";
import { WithStyles, Theme } from "@material-ui/core";

import {
  CachedPositions,
  fetchSourcesFromServer,
  createTextSource,
  getNextChunk,
  getSourcePreview
} from "../ChunkRetriever";

import TextSourceChooser, { TextSource } from "./TextSourceChooser";
import { NumberedWord } from "../Word";
import TextSourceAccumulator from "./TextSourceAccumulator";
import SavedWordsContainer from "../SavedWordsContainer";

import { PersistedTextSource, LocalTextSource } from "../store";
import TextSourcePreviewer from "../TextSourcePreview";

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
  sourcePreview: [number, string[]];
}
type TextSourcePair = [string, PersistedTextSource];

class AppClass extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    fetchSourcesFromServer(props.textSourcePositions)
      .then((remoteSources: PersistedTextSource[]) => {
        this.setState(
          update(this.state, {
            sources: {
              $add: remoteSources.map(
                source => [source.id, source] as TextSourcePair
              )
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
      sources: new Map(this.importLocalSources(props.localTextSources)),
      sourcePreview: [0, []]
    };
  }

  importLocalSources = (localTextSources: LocalTextSource[]) =>
    localTextSources
      .map(({ id, chunks }) =>
        createTextSource(id, chunks, this.props.textSourcePositions[id])
      )
      .map(source => [source.id, source] as TextSourcePair);

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
    this.getTextSource(textSourceId).forEach(source =>
      this.switchToNextChunk_(source, chunkId)
    );

  switchToNextChunk_ = (textSource: PersistedTextSource, chunkId: number) =>
    getNextChunk(textSource, chunkId)
      .then(chunk => this.switchToChunk(textSource, chunk.newId, chunk.text))
      .catch(fail => alert("Error fetching chunk from server: " + fail));

  setTextSource = (id: string) => {
    if (this.state.textSourceId === id) return;

    this.switchToNextChunk(this.props.textSourcePositions[id] || 1, id);
  };

  switchToChunk = (
    source: PersistedTextSource,
    newId: number,
    text: string
  ) => {
    this.props.setText(text, newId, source.id);
    this.setState({
      textSourceId: source.id,
      sources: update(this.state.sources as any, {
        [source.id]: {
          chunkId: { $set: newId }
        }
      })
    });

    getSourcePreview(source, newId)
      .then(sourcePreview => this.setState({ sourcePreview }))
      .catch(() => this.setState({ sourcePreview: [0, []] }));
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
          lg={hasTextSource ? 4 : 4}
          md={hasTextSource ? 5 : 6}
          sm={hasTextSource ? 5 : 8}
          xs={12}
        >
          <Paper className={classes.paper}>
            <TextSourceChooser
              textSources={this.state.sources}
              setTextSource={this.setTextSource}
              currentSourceId={textSourceId}
              removeTextSource={this.removeTextSource}
            />
          </Paper>
          <TextSourcePreviewer
            text={this.state.sourcePreview[1]}
            firstChunkId={this.state.sourcePreview[0]}
            currentChunkId={
              textSourceId
                ? this.props.textSourcePositions[textSourceId]
                : undefined
            }
            switchToChunk={this.switchToNextChunk}
            paperClassName={classes.paper}
          />
        </Grid>
        <Grid item lg={8} md={hasTextSource ? 7 : 6} sm={hasTextSource ? 7 : 8} xs={12}>
          {isUndefined(textSourceId) ? null : (
            <TextSourceAccumulator
              switchChunk={this.switchChunk}
              textSourceId={textSourceId}
            />
          )}
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
    padding: theme.spacing.unit * 2,
    marginBottom: theme.spacing.unit * 1
  }
});

export default withStyles(styles)(AppClass);
