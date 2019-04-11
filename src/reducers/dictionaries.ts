import { getType } from "typesafe-actions";
import * as actions from "../actions";
import { WordAction } from "../../src/store";

export interface DictionaryStore {
  current: string;
  allKnown: string[];
}

export function dictionaryReducer(dictionary: string = "", action: WordAction) {
  switch (action.type) {
    case getType(actions.setDictionary):
      return action.payload;
  }
  return dictionary;
}
