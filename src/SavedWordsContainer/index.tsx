import * as React from "react";
import { State } from "../store";
import { SavedWord, SavedChunks } from "../reducers/savedChunks";
import { connect } from "react-redux";
import { NumberedWord } from "..//Word";

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
import Typography from "@material-ui/core/Typography";

import { reverse, isUndefined, flattenDeep, flatMap, values } from "lodash";

export const NoWordsTable = withStyles({
  root: { textAlign: "center", fontStyle: "italic" }
})((props : any) => (
  <TableBody>
    <TableRow>
      <TableCell colSpan={2} classes={props.classes}>
        No words added yet
      </TableCell>
    </TableRow>
  </TableBody>
));

interface Props {
  savedChunks: SavedChunks;
  textSourceId?: string;
  maxRows: number;
}

const wordCellStyles = createStyles({
  root: {
    paddingRight: 0,
    textAlign: "center",
    fontSize: "1.1em"
  }
});

type StyledProps = Props & WithStyles<typeof wordCellStyles>;

class SavedWordsContainer extends React.PureComponent<
  StyledProps,
  { words: SavedWord[] }
> {
  state = { words: [] };

  componentWillReceiveProps(nextProps: StyledProps) {
    if (
      nextProps.savedChunks !== this.props.savedChunks ||
      nextProps.textSourceId !== this.props.textSourceId ||
      nextProps.maxRows !== this.props.maxRows
    ) {
      this.setState({
        words: reverse(
          (isUndefined(nextProps.textSourceId)
            ? flattenDeep(flatMap(nextProps.savedChunks).map(values))
            : flatMap(nextProps.savedChunks[nextProps.textSourceId])
          ).slice(-nextProps.maxRows)
        )
      });
    }
  }

  renderSavedWord = (word: SavedWord) => {
    return (
      <TableRow key={word.word}>
        <TableCell classes={this.props.classes}>{word.word}</TableCell>
        <TableCell>{word.meaning}</TableCell>
      </TableRow>
    );
  };

  renderTableBody = () => {
    if (this.state.words.length < 1) return <NoWordsTable />;

    return <TableBody>{this.state.words.map(this.renderSavedWord)}</TableBody>;
  };

  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} classes={this.props.classes}>
              <Typography variant="headline">Recently added words</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        {this.renderTableBody()}
      </Table>
    );
  }
}

export const styled = withStyles(wordCellStyles)(SavedWordsContainer);

export default connect<
  { savedChunks: SavedChunks },
  void,
  { textSourceId?: string },
  State
>(state => ({
  savedChunks: state.savedChunks
}))(styled);
