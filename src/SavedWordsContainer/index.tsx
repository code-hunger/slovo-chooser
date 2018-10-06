import * as React from "react";
import { State, SavedWord, SavedChunks } from "../store";
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

import * as _ from "lodash";

export const NoWordsTable = withStyles({
  root: { textAlign: "center", fontStyle: "italic" }
})(props => (
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
      nextProps.textSourceId !== this.props.textSourceId
    ) {
      this.setState({
        words: _.reverse(
          (_.isUndefined(nextProps.textSourceId)
            ? _.flattenDeep(_.flatMap(nextProps.savedChunks).map(_.values))
            : _.flatMap(nextProps.savedChunks[nextProps.textSourceId])
          ).slice(-10)
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
  }

  renderTableBody = () => {
    if (this.state.words.length < 1) return <NoWordsTable />;

    return <TableBody>{this.state.words.map(this.renderSavedWord)}</TableBody>;
  }

  render() {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2} classes={this.props.classes}>
              <Typography variant="headline">
              Recently added words
            </Typography>
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
