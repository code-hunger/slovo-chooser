import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

interface Props {
  text: string[];
  firstChunkId: number;
  currentChunkId?: number;

  paperClassName: string;
}

export default class TextSourcePreviewer extends React.PureComponent<Props> {
  renderChunk = (chunk: string, id: number) => {
    const isCurrent = this.props.firstChunkId + id == this.props.currentChunkId;
    return (
      <p style={{ color: isCurrent ? "red" : "inherit" }}>
        {id + this.props.firstChunkId}: {chunk}
      </p>
    );
  };

  render() {
    if (!this.props.text.length || !this.props.currentChunkId) return null;

    return (
      <Paper className={this.props.paperClassName}>
        <Typography variant="headline">Text source preview</Typography>
        {this.props.text.map(this.renderChunk)}
      </Paper>
    );
  }
}
