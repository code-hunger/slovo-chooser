import * as React from "react";

import withStyles from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { WithStyles, Theme } from "@material-ui/core";

interface DictionaryProps extends WithStyles<typeof styles>{
  word: string;
}

interface State {
  url: string;
}

const styles = createStyles({
  root: {
    position: 'relative'
  }
});

class Dictionary extends React.Component<DictionaryProps, State> {
  state = { url: "" };

  render() {
    const src = "http://localhost:3001/showdict?word=" + this.props.word;
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <iframe src={src} width="100%" />
      </div>
    );
  }
}

export default withStyles(styles)(Dictionary);
