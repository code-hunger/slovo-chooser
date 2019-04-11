import * as React from "react";
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

import { sourceFetchers } from "../../ChunkRetriever";
import TextAdder from "../TextAdder";
import { PersistedTextSource } from "../../store";

const styles = (theme: Theme) =>
  createStyles({
    selected: {
      color: "blue"
    },
    chunkId: {
      color: "grey",
      margin: theme.spacing.unit
    }
  });

export interface TextSource {
  id: string;
  description: string;
  chunkId?: number;
  origin: keyof (typeof sourceFetchers);
}

interface Props {
  textSources: Map<string, PersistedTextSource>;
  setTextSource: (id: string) => void;
  currentSourceId?: string;
  removeTextSource: (id: string) => false | (() => void);
}

type PropsWithStyles = Props & WithStyles<typeof styles>;

interface State {
  collapsed: boolean;
}

class TextSourceChooser extends React.PureComponent<PropsWithStyles, State> {
  state = { collapsed: false };

  renderTextSourceItem = ({ id, description, chunkId }: TextSource) => {
    const classes = this.props.classes;
    const isCurrent = id === this.props.currentSourceId;
    const textSourceRemover = this.props.removeTextSource(id);
    return (
      <ListItem
        button
        key={id.toString()}
        onClick={() => this.props.setTextSource(id)}
        disabled={isCurrent}
        className={isCurrent ? classes.selected : undefined}
      >
        <span className={classes.chunkId}>{chunkId}</span>
        {description}
        {textSourceRemover !== false ? (
          <ListItemSecondaryAction>
            <IconButton aria-label="Delete" onClick={textSourceRemover}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        ) : null}
      </ListItem>
    );
  };

  renderList = () => (
    <List>
      {Array.from(this.props.textSources.values(), this.renderTextSourceItem)}
    </List>
  );

  toggleCollapse = () => {
    this.setState(({ collapsed }) => ({ collapsed: !collapsed }));
  };

  render() {
    return (
      <>
        <Typography variant="headline" onClick={this.toggleCollapse}>
          Choose a text source
        </Typography>
        {this.state.collapsed ? null : (
          <>
            {this.renderList()}
            <TextAdder autoOpen={this.props.textSources.size < 1} />
          </>
        )}
      </>
    );
  }
}

export default withStyles(styles)(TextSourceChooser);
