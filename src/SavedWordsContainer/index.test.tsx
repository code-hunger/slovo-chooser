import * as React from "react";
import * as ReactDOM from "react-dom";
import { createStore } from "redux";
import { Provider } from "react-redux";
import * as _ from "lodash";
import { mount, shallow } from "enzyme";

import { reducers } from "../store";
import { styled as SavedWordsContainer, NoWordsTable } from "./index";
import { setText } from "../actions";

const generateSavedWords = chunk =>
  _.range(10).map(n => [
    { word: chunk + "word" + n, meaning: "meaning", context: "" }
  ]);

const generateSavedChunks = wordGenerator =>
  _.merge.apply(
    null,
    _.range(5)
      .map(n => "chunk" + n)
      .map(s => ({ [s]: wordGenerator(s) }))
  );

const getRows = swc => swc.find("TableBody TableRow");

const noWordsTable = mount(<NoWordsTable />);

it("works when no text source is selected", () => {
  const savedChunks = generateSavedChunks(generateSavedWords);
  const generatedWords = _.flatten(_.values(savedChunks));
  const store = createStore(reducers, {
    savedChunks: {
      someSourceId: savedChunks
    }
  });

  const swc = mount(
    <SavedWordsContainer textSourceId="someSourceId" savedChunks={{}} />
  );

  expect(getRows(swc)).toHaveLength(noWordsTable.find('TableBody TableRow').length)

  store.dispatch(setText("ABC", 1, "chunk0"));
  swc.setProps({ savedChunks: store.getState().savedChunks }).update();

  expect( getRows(swc)).toHaveLength(savedChunks["chunk0"].length);
});
