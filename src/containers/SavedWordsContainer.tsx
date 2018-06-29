import * as React from "react";
import { State, SavedWord, SavedChunks } from "../store";
import { connect, Dispatch } from "react-redux";

import withStyles from "@material-ui/core/styles/withStyles";
import IconButton from "@material-ui/core/IconButton";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import DeleteIcon from "@material-ui/icons/Delete";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { createStyles, WithStyles, Theme } from "@material-ui/core";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import reactbind from "react-bind-decorator";
import * as _ from "lodash";

interface Props {
  words: SavedWord[];
  textSourceId?: string;
}

const wordCellStyles = createStyles({
  root: {
    paddingRight: 0,
    textAlign: "center",
    fontSize: "1.1em"
  }
});

type StyledProps = Props & WithStyles<typeof wordCellStyles>;

@reactbind()
class SavedWordsContainer extends React.Component<StyledProps> {
  renderSavedWord(word: SavedWord) {
    return (
      <TableRow key={word.word}>
        <TableCell classes={this.props.classes}>{word.word}</TableCell>
        <TableCell>{word.meaning}</TableCell>
      </TableRow>
    );
  }
  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="dense">Word</TableCell>
            <TableCell>Meaning</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{this.props.words.map(this.renderSavedWord)}</TableBody>
      </Table>
    );
  }
}

export default connect<
  { words: SavedWord[] },
  void,
  { textSourceId?: string },
  State
>((state, ownProps) => ({
  words: _.reverse(
    _.isUndefined(ownProps.textSourceId)
      ? _.flattenDeep(_.flatMap(state.savedChunks).map(_.values))
      : _.flatMap(state.savedChunks[ownProps.textSourceId])
  ).slice(0, 10)
}))(withStyles(wordCellStyles)(SavedWordsContainer));
