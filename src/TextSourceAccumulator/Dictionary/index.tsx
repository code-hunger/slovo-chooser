import * as React from "react";
import { connect } from "react-redux";
import { State as ReduxState } from "../../store";

import withStyles from "@material-ui/core/styles/withStyles";
import createStyles from "@material-ui/core/styles/createStyles";
import { WithStyles, Theme } from "@material-ui/core";

import Button from "@material-ui/core/Button";

import ConfigDialog from "./ConfigDialog";

interface DictionaryProps extends WithStyles<typeof styles> {
  word: string;
  setDictionary: (url: string) => void;
  url: string;
}

interface State {
  isConfiguring: boolean;
}

const styles = createStyles({
  root: {
    position: "relative"
  },
  configButton: {
    position: "absolute",
    right: 0
  }
});

class Dictionary extends React.PureComponent<DictionaryProps, State> {
  state = { isConfiguring: false };

  handleClickOpen = () => {
    this.setState({ isConfiguring: true });
  };

  handleClose = (url: string) => {
    this.props.setDictionary(url);
    this.setState({ isConfiguring: false });
  };

  render() {
    const classes = this.props.classes;
    return (
      <div className={classes.root}>
        <Button onClick={this.handleClickOpen} className={classes.configButton}>
          Configure dictionary
        </Button>
        <ConfigDialog
          isOpen={this.state.isConfiguring || this.props.url.length === 0}
          defaultUrl={this.props.url}
          setDictionary={this.handleClose}
        />
        {this.state.isConfiguring ? null : (
          <iframe
            src={this.props.url.replace("{}", this.props.word)}
            width="100%"
          />
        )}
      </div>
    );
  }
}

const styled = withStyles(styles)(Dictionary);

export default connect<
  { url: string },
  { setDictionary: (url: string) => void },
  { word: string },
  ReduxState
>(
  state => ({
    url: state.dictionary
  }),
  dispatch => ({
    setDictionary(url) {
      dispatch({ type: "SET_DICTIONARY", url });
    }
  })
)(styled);
