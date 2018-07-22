import * as React from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

interface ConfigProps {
  isOpen: boolean;
  setDictionary: (url: string) => void;
  defaultUrl: string;
}

export default class ConfigDialog extends React.PureComponent<ConfigProps> {
  private input: HTMLInputElement;

  handleClose = () => this.props.setDictionary(this.input.value);

  inputRef = (input: HTMLInputElement) => {
    this.input = input;
  };

  render() {
    return (
      <Dialog open={this.props.isOpen} onClose={this.handleClose}>
        <DialogTitle id="form-dialog-title">Configure dictionary</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Set a URL for the dictionary. <kbd>&#123;&#125;</kbd> will be
            replaced with the searched word.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Dictionary URL"
            type="url"
            fullWidth
            inputRef={this.inputRef}
            defaultValue={this.props.defaultUrl}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

