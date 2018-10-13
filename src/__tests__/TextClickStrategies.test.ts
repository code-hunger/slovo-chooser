import * as strategies from "../TextClickStrategies";
import { range } from "lodash";
import * as actions from "../actions";
import { getType } from "typesafe-actions";

it("context boundaries properly set", () => {
  const wordCount = 10;
  const contextSelector = new strategies.ContextSelector(wordCount);

  const wordsToClick = range((wordCount - 1) / 2).concat(
    range((wordCount - 1) / 2, 0)
  );

  wordsToClick.forEach(i => {
    expect(contextSelector.onWordClick(i)).toEqual(
      actions.setContextBoundaries(i, wordCount - i)
    );
  });
});

it("unknown word clicked dispatches properly", () => {
  const unknownWordSelector = strategies.UnknownWordSelector;

  range(10).forEach(i => {
    expect(unknownWordSelector.onWordClick(i)).toEqual(actions.wordClicked(i));
  });
});
