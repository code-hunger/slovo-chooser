import * as React from "react";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

interface Props {
  onDone: (id: string, text: string) => void;
  autoOpen: boolean;
}

interface State {
  id: string;
  value: string;
  isOpen: boolean;
}

export default class TextAdder extends React.PureComponent<Props, State> {
  state = { id: "", value: "", isOpen: false };

  onDone = () => {
    if (!this.isValid()) return;

    this.props.onDone(this.state.id, this.state.value);
    this.setState({ id: "", value: "" });

    this.handleClose();
  };

  handleClickOpen = () => {
    this.setState({ isOpen: true });
  };

  handleClose = () => {
    this.setState({ isOpen: false });
  };

  onChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    switch (e.target.name) {
      case "text":
        this.setState({ value: e.target.value });
        break;
      case "textId":
        this.setState({ id: e.target.value });
        break;
    }
  };

  isValid = () => {
    return this.state.id.length > 1 && this.state.value.length > 10;
  };

  render() {
    return (
      <>
        <Button
          onClick={this.handleClickOpen}
          variant="outlined"
          color="primary"
        >
          Add a new text source
        </Button>
        <Dialog
          open={this.state.isOpen || this.props.autoOpen}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
          fullWidth
        >
          <DialogTitle id="form-dialog-title">
            Add a new text source
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Text source name"
              type="text"
              onChange={this.onChange}
              name="textId"
              value={this.state.id}
            />
            <TextField
              onChange={this.onChange}
              name="text"
              value={this.state.value}
              label="Enter text source content here"
              multiline
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onDone} color="primary" disabled={!this.isValid()}>
              Add text source
            </Button>
            <Button
              onClick={this.handleClose}
              color="secondary"
              disabled={this.props.autoOpen}
            >
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
