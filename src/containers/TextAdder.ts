import store, { State, WordAction, SavedWord } from "../store";
import { connect, Dispatch } from "react-redux";
import TextAdder from "../views/TextAdder";

interface Props {
  onDone: (id: string, text: string) => void;
}

export default connect<void, Props, void, State>(
  undefined,
  (dispatch: Dispatch<WordAction>) => ({
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
  })
)(TextAdder);
