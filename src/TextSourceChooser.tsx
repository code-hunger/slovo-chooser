import * as React from "react";
import { TextAdder } from "./TextAdder";
import { withStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import { createStyles, WithStyles, Theme } from "@material-ui/core";
import Badge from "@material-ui/core/Badge";

const styles = (theme: Theme) =>
  createStyles({
    selected: {
      color: "blue"
    }
  });

interface TextSource<IdType> {
  id: IdType;
  description: string;
  chunkId?: number;
}

interface Props<IdType> {
  textSources: TextSource<IdType>[];
  setTextSource: (id: IdType) => void;
  addTextSource?: (id: string, text: string) => void;
  currentSourceId?: IdType;
}

type PropsWithStyles<T> = Props<T> & WithStyles<typeof styles>;

interface State {}

class TextSourceChooser<IdType> extends React.PureComponent<
  PropsWithStyles<IdType>,
  State
> {
  render() {
    const classes = this.props.classes;
    return (
      <>
        Choose a text source:
        <List>
          {this.props.textSources.map(x => (
            <ListItem
              button
              key={x.id.toString()}
              onClick={() => this.props.setTextSource(x.id)}
              className={
                x.id === this.props.currentSourceId
                  ? classes.selected
                  : undefined
              }
            >
              <Badge color="primary" badgeContent={x.chunkId}>
                {x.description}
              </Badge>
            </ListItem>
          ))}
        </List>
        {this.props.addTextSource ? (
          <TextAdder onDone={this.props.addTextSource} />
        ) : null}
      </>
    );
  }
}

export default withStyles(styles)(TextSourceChooser);
