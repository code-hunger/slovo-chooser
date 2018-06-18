import * as React from "react";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, WithStyles, Theme } from "@material-ui/core";
import Badge from "@material-ui/core/Badge";
import reactbind from "react-bind-decorator";

const styles = (theme: Theme) =>
  createStyles({
    selected: {
      color: "blue"
    }
  });

export interface TextSource<IdType> {
  id: IdType;
  description: string;
  chunkId?: number;
}

interface Props<IdType> {
  textSources: TextSource<IdType>[];
  setTextSource: (id: IdType) => void;
  currentSourceId?: IdType;
}

type PropsWithStyles<T> = Props<T> & WithStyles<typeof styles>;

interface State {}

@reactbind()
class TextSourceChooser<IdType> extends React.PureComponent<
  PropsWithStyles<IdType>,
  State
> {
  renderTextSourceItem(x: TextSource<IdType>) {
    const classes = this.props.classes;
    const isCurrent = x.id === this.props.currentSourceId;
    return (
      <ListItem
        button
        key={x.id.toString()}
        onClick={() => this.props.setTextSource(x.id)}
        disabled={isCurrent}
        className={isCurrent ? classes.selected : undefined}
      >
        <Badge color="primary" badgeContent={x.chunkId}>
          {x.description}
        </Badge>
      </ListItem>
    );
  }

  render() {
    return (
      <>
        Choose a text source:
        <List>{this.props.textSources.map(this.renderTextSourceItem)}</List>
      </>
    );
  }
}

export default withStyles(styles)(TextSourceChooser);
