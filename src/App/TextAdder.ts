import { State } from "../store";
import { addLocalTextSource } from "../actions";
import { connect } from "react-redux";
import TextAdder from "../TextAdder";
import { bindActionCreators } from "redux";

interface DispatchProps {
  onDone: (id: string, text: string) => void;
}

interface StateProps {
  autoOpen: boolean;
}

const onDone = (id: string, text: string) =>
  addLocalTextSource({ id, description: id, text });

export default connect<StateProps, DispatchProps, void, State>(
  state => ({ autoOpen: state.localTextSources.length < 1 }),
  dispatch => bindActionCreators({ onDone }, dispatch)
)(TextAdder);
