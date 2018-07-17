import * as React from "react";
import reactbind from "react-bind-decorator";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

interface Props {
  onDone: (id: string, text: string) => void;
}

interface State {
  isOpen: boolean;
}

@reactbind()
export default class TextAdder extends React.PureComponent<Props, State> {
  private textField: { value: string };
  private textIdField: { value: string };

  state = { isOpen: false };

  onDone() {
    this.props.onDone(this.textIdField.value, this.textField.value);
    this.handleClose();
  }

  handleClickOpen() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  inputRef(e: HTMLInputElement | HTMLTextAreaElement) {
    if (e.name === "text") this.textField = e;
    else if (e.name === "textId") this.textIdField = e;
  }

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
          open={this.state.isOpen}
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
              name="textId"
              inputRef={this.inputRef}
            />
            <TextField
              name="text"
              inputRef={this.inputRef}
              label="Enter text source content here"
              multiline
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.onDone} color="primary">
              Add text source
            </Button>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
}
