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
import Badge from "@material-ui/core/Badge";
import Typography from "@material-ui/core/Typography";
import reactbind from "react-bind-decorator";

import * as _ from "lodash";

interface Props {
  words: SavedWord[];
  textSourceId?: string;
}

@reactbind()
class SavedWordsContainer extends React.Component<Props> {
  renderSavedWord(word: SavedWord) {
    return (
      <ListItem key={word.word}>
        <ListItemText>
          {word.word}
          {word.meaning}
        </ListItemText>
      </ListItem>
    );
  }
  render() {
    return <List>{this.props.words.map(this.renderSavedWord)}</List>;
  }
}

export default connect<
  { words: SavedWord[] },
  void,
  { textSourceId?: string },
  State
>(
  (state, ownProps) =>
    ({
      words: _.reverse(
        _.isUndefined(ownProps.textSourceId)
          ? _.flattenDeep(_.flatMap(state.savedChunks).map(_.values))
          : _.flatMap(state.savedChunks[ownProps.textSourceId])
      )
    } as Props)
)(SavedWordsContainer);
