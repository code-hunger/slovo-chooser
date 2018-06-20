import * as React from "react";
import reactbind from "react-bind-decorator";
import store, { State as ReduxStore, WordAction, SavedWord } from "../store";
import { connect, Dispatch } from "react-redux";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

type Props = PropsFromDispatch;

interface PropsFromDispatch {
  onDone: (id: string, text: string) => void;
}

interface State {
  id: string;
  value: string;
  isOpen: boolean;
}

@reactbind()
class TextAdder extends React.PureComponent<Props, State> {
  state = { id: "", value: "", isOpen: false };

  onChange(e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) {
    switch (e.target.name) {
      case "text":
        this.setState({ value: e.target.value });
        break;
      case "textId":
        this.setState({ id: e.target.value });
        break;
    }
  }

  onDone() {
    if (this.isValid()) {
      this.props.onDone(this.state.id, this.state.value);
      this.setState({ id: "", value: "" });
    }
    this.handleClose();
  }

  handleClickOpen() {
    this.setState({ isOpen: true });
  }

  handleClose() {
    this.setState({ isOpen: false });
  }

  isValid() {
    return this.state.id.length > 1 && this.state.value.length > 10;
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
            <Button
              onClick={this.onDone}
              color="primary"
              disabled={!this.isValid()}
            >
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

const mapDispatchToProps = (
  dispatch: Dispatch<WordAction>
): PropsFromDispatch => ({
  onDone(id: string, text: string) {
    dispatch({
      type: "ADD_LOCAL_TEXT_SOURCE",
      source: {
        id,
        description: id,
        text
      }
    });
  }
});

export default connect<void, PropsFromDispatch, void, ReduxStore>(
  undefined,
  mapDispatchToProps
)(TextAdder);
