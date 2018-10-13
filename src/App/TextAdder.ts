import { State, WordAction, SavedWord } from "../store";
import { addLocalTextSource } from "../actions";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import TextAdder from "../TextAdder";

interface DispatchProps {
  onDone: (id: string, text: string) => void;
}

interface StateProps {
  autoOpen: boolean;
}

export default connect<StateProps, DispatchProps, void, State>(
  state => ({ autoOpen: state.localTextSources.length < 1 }),
  (dispatch: Dispatch<WordAction>) => ({
    onDone(id: string, text: string) {
      dispatch(
        addLocalTextSource({
          id,
          description: id,
          text
        })
      );
    }
  })
)(TextAdder);
