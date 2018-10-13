import * as ReactDOM from "react-dom";
import * as React from "react";
import App from "../App";

import { Provider } from "react-redux";
import { createStore } from "redux";
import { reducers } from "../../src/store";

const store = createStore(reducers);

it("renders without crashing", () => {
  const div = document.createElement("div") as HTMLElement;
  ReactDOM.render(
    <Provider store={store}>
      <App />
    </Provider>,
    div
  );
});
