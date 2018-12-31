import * as React from "react";
import { Provider } from "react-redux";
import { mount } from "enzyme";
import { createStore } from "redux";
import { stubTrue } from "lodash";

import { reducers } from "../store";
import TextSourceAccumulator from "./index";
import * as strategies from "../TextClickStrategies";

it("text source accumulator renders", () => {
  const words = [{ index: 0, word: "word", classNames: [] }];

  const onWordClick = jest.fn();

  const onCardSave = jest.fn();
  const store = createStore(reducers, { words })

  const tsac = mount(
    <Provider store={store}>
      <TextSourceAccumulator
        textSourceId="empty"
        textSourcePositions={{}}
        switchChunk={jest.fn()}

        words={words}

        isSelectingContext={false}
        onWordClick={onWordClick}
        onContextMenu={stubTrue}

        onCardSave={onCardSave}
      />
    </Provider>
  );

  const teditor = tsac.find('.textEditor')
  expect(expect .length).toBe(1)

  const wordElements = teditor.find('.word')
  expect(wordElements.length).toBe(1)

  wordElements.first().simulate('click')
  expect(onWordClick).toBeCalledWith(strategies.UnknownWordSelector, 0)
});
