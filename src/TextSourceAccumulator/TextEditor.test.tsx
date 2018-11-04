import * as ReactDOM from "react-dom";
import * as React from "react";
import { TextEditor } from "shadow-cljs/project.TextEditor";
import { UnknownWordSelector } from "../TextClickStrategies";
import { mount } from "enzyme";
import { createStore } from "redux";
import { Provider } from "react-redux";
import { reducers } from "../store";

import TextWord from "./EnhancedTextWord";

it("teditor word click works", () => {
  const onWordClick = jest.fn(),
    onContextMenu = jest.fn();

  const words = [{ index: 0, word: "word", classNames: [] }];
  const store = createStore(reducers, { words });

  const textEditor = mount(
    <Provider store={store}>
      <TextEditor
        className=""
        tabIndex={0}
        emptyText=""
        onWordClick={onWordClick}
        onContextMenu={onContextMenu}
        words={words}
        wordType={TextWord}
      />
    </Provider>
  );

  const wordElements = textEditor.find(".word");
  expect(wordElements).toHaveLength(words.length)

  wordElements.first().simulate("click");
  expect(onWordClick).toBeCalledWith(0);

});
