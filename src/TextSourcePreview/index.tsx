import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { Maybe } from "monet";

interface Props {
  text: string[];
  firstChunkId: number;
  currentChunkId?: number;

  paperClassName: string;
}

interface State {
  prevShownCount: number;
  nextShownCount: number;
}

const max = (a, b) => (a > b ? a : b);
const equals = a => b => a == b;

export default class TextSourcePreviewer extends React.PureComponent<
  Props,
  State
> {
  state = { prevShownCount: 3, nextShownCount: 3 };

  currentChunkIndex = () =>
    Maybe.fromNull(this.props.currentChunkId).map(
      n => n - this.props.firstChunkId
    );

  firstShown = () =>
    this.currentChunkIndex()
      .map(current => max(current - this.state.prevShownCount, 0))
      .orJust(0);

  renderChunk = (chunk: string, id: number) => {
    const isCurrent = this.currentChunkIndex()
      .map(equals(this.firstShown() + id))
      .orJust(false);

    return (
      <p style={{ color: isCurrent ? "red" : "inherit" }} key={id}>
        {id + this.firstShown() + 1}: {chunk}
      </p>
    );
  };

  render() {
    if (!this.props.text.length || !this.props.currentChunkId) return null;

    const current: number = this.props.currentChunkId - this.props.firstChunkId;

    return (
      <Paper className={this.props.paperClassName}>
        <Typography variant="headline">Text source preview</Typography>
        {this.props.text
          .slice(this.firstShown(), current + this.state.nextShownCount + 1)
          .map(this.renderChunk)}
      </Paper>
    );
  }
}
