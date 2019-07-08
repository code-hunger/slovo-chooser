import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { State, LocalTextSource } from "../store";
import { addLocalTextSource } from "../actions";
import { TextAdder } from "shadow-cljs/project.TextAdder";

interface DispatchProps {
  onDone: (id: string, text: string) => void;
}

interface OutsideProps {
  autoOpen: boolean;
}

const onDone = (id: string, text: string) =>
  addLocalTextSource({
    id,
    description: id,
    chunks: text,
    origin: "local"
  });

export default connect<void, DispatchProps, OutsideProps, State>(
  null,
  dispatch => bindActionCreators({ onDone }, dispatch)
)(TextAdder);
