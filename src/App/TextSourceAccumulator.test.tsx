import * as ReactDOM from "react-dom";
import * as React from "react";

import TextSourceAccumulator from "./TextSourceAccumulator";
import { mount } from "enzyme";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducers } from "../store";

it("selects words properly", () => {
  const onWordClick = jest.fn(),
    onContextMenu = jest.fn(),
    switchChunk = jest.fn();

  const words = [{ index: 0, word: "word", classNames: [] }];
  const store = createStore(reducers, { words });

  const tsac = mount(
    <Provider store={store}>
      <TextSourceAccumulator
        textSourceId="sourceId"
        switchChunk={switchChunk}
      />
    </Provider>
  );

  const wordElements = tsac.find(".word");
  expect(wordElements).toHaveLength(words.length);

  const firstWordElement = wordElements.first();
  firstWordElement.simulate("click");

  const markedWords = store.getState().cardState.words.marked;
  expect(markedWords).toContain(words[0].index);
});
