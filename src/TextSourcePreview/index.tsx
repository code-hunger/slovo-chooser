import * as React from "react";

import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";

interface Props {
  text: string[];
  paperClassName: string;
}

export default class TextSourcePreviewer extends React.PureComponent<Props> {
  renderChunk = (chunk: string) => <p>{chunk}</p>;

  render() {
    if (!this.props.text.length) return null;

    return (
      <Paper className={this.props.paperClassName}>
        <Typography variant="headline">Text source preview</Typography>
        {this.props.text.map(this.renderChunk)}
      </Paper>
    );
  }
}
