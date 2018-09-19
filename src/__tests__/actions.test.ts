import * as actions from "../actions";
import { getType } from "typesafe-actions";

it("creates 'context select boundary action'", () => {
  const setContextBoundaries = actions.setContextBoundaries;

  expect(setContextBoundaries(0, 10)).toEqual({
    type: getType(setContextBoundaries),
    payload: {
      start: 0,
      length: 10
    }
  });
});
