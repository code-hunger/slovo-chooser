import * as ReactDOM from "react-dom";
import * as React from "react";
import TextEditor from "./TextEditor";
import { UnknownWordSelector } from "../TextClickStrategies";
import { mount } from "enzyme";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducers } from "../store";

it("teditor word click works", () => {
  const unknownWordSelector = UnknownWordSelector;
  unknownWordSelector.onWordClick = jest.fn();

  const words = [{ index: 0, word: "word", classNames: [] }];
  const store = createStore(reducers, { words });

  const textEditor = mount(
    <Provider store={store}>
      <TextEditor
        className=""
        tabIndex={0}
        emptyText=""
        clickStrategy={unknownWordSelector}
      />
    </Provider>
  );

  textEditor
    .find(".word")
    .first()
    .simulate("click");

  expect(unknownWordSelector.onWordClick).toBeCalledWith(0);
});
