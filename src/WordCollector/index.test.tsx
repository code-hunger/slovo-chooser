import * as React from "react";

import { WordCollector } from "shadow-cljs/project.WordCollector";
import { SimpleWord } from "../Word";
import { mount } from "enzyme";

it("word collector fires click events", () => {
  const onWordClick = jest.fn();
  const onContextMenu = jest.fn();

  const words = [{ index: 0, word: "word", classNames: [] }];
  const wordCollector = mount(
    <WordCollector
      words={words}
      wordType={SimpleWord}
      onWordClick={onWordClick}
      onContextMenu={onContextMenu}
    />
  );

  const wordElements = wordCollector.find(".word");
  expect(wordElements.length).toBe(words.length);

  wordElements.first().simulate("click");
  expect(onWordClick).toBeCalledWith(
    expect.objectContaining({ type: "click" })
  );
});
