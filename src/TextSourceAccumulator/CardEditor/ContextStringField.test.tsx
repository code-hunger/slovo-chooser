import * as React from "react";
import * as _ from "lodash";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import { reducers } from "../../store";
import { createStore } from "redux";
import { setContextBoundaries, toggleSelectingContext } from "../../actions";

import ContextStringField from "./ContextStringField";

const generateWords = count =>
  _.range(count).map(i => ({
    index: i,
    word: "word" + i,
    classNames: []
  }));

it("renders without errors", () => {
  const onReady = jest.fn();
  const wordCount = 10;
  const store = createStore(reducers, {
    words: generateWords(wordCount),
    cardState: { isSelectingContext: false }
  });

  const csf = mount(
    <Provider store={store}>
      <ContextStringField unknownWord="unbekannt" onReady={onReady} />
    </Provider>
  );

  expect(csf.find("button")).toHaveLength(0);
  expect(csf.find("input")).toHaveLength(0);

  store.dispatch(setContextBoundaries(3, 4));

  expect(csf.update().find("input")).toHaveLength(1);

  store.dispatch(toggleSelectingContext());

  const cardState = store.getState().cardState;
  expect(cardState.isSelectingContext).toBeTruthy();

  expect(csf.update().find("button")).toHaveLength(1);
});
