import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import "./index.css";

import { throttle, pick } from "lodash";
import { Provider } from "react-redux";
import { createStore } from "redux";
import { reducers } from "./store";
import { loadState, persistState } from "./localStorage";

const store = createStore(reducers, loadState());

store.subscribe(
  throttle(
    () =>
      persistState(
        pick(store.getState(), [
          "savedChunks",
          "savedWords",
          "localTextSources",
          "textSourcePositions",
          "dictionary"
        ])
      ),
    2000
  )
);

if (process.env.NODE_ENV !== "production") {
  const { whyDidYouUpdate } = require("why-did-you-update");
  whyDidYouUpdate(React);
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root") as HTMLElement
);

registerServiceWorker();
