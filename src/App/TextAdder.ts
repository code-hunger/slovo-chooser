import { State } from "../store";
import { addLocalTextSource } from "../actions";
import { connect } from "react-redux";
import TextAdder from "../TextAdder";
import { bindActionCreators } from "redux";

interface DispatchProps {
  onDone: (id: string, text: string) => void;
}

interface OutsideProps {
  autoOpen: boolean;
}

const onDone = (id: string, text: string) =>
  addLocalTextSource({ id, description: id, text });

export default connect<void, DispatchProps, OutsideProps, State>(
  null,
  dispatch => bindActionCreators({ onDone }, dispatch)
)(TextAdder);
