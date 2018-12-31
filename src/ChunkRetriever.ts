import axios from "axios";
import { memoize, map } from "lodash";
import { TextSource } from "./App/TextSourceChooser";
import { PersistedTextSource } from "./store";

type MyPr = Promise<{ text: string; newId: number }>;

export interface CachedPositions {
  [id: string]: number;
}

function makeLocalFetcher(text: string) {
  const textLines =
    typeof text === "string" // backward compatability
      ? text.split("\n").filter(line => line !== "")
      : text;

  return {
    getChunk: (chunkId: number): MyPr =>
      new Promise((resolve, failure) =>
        chunkId <= textLines.length && chunkId >= 1
          ? resolve({ text: textLines[chunkId - 1], newId: chunkId })
          : failure("Out of bounds")
      ),
    getPreview: (chunkId: number) =>
      Promise.resolve([1, textLines] as [number, string[]])
  };
}

function makeRemoteFetcher(file: string) {
  return {
    getChunk: (chunkId: number): MyPr =>
      axios
        .get("http://localhost:3000/text", {
          params: { chunkId, file },
          responseType: "json"
        })
        .then(
          ({ data }) => {
            if (data.error) throw data.error;
            return { text: data.text, newId: data.chunkId };
          },
          error => {
            if (error.response) {
              throw error.response.data.error;
            }
            throw "Unknown error happened";
          }
        ),
    getPreview(chunkId: number) {
      return Promise.reject();
    }
  };
}

export const sourceFetchers = {
  local: memoize(makeLocalFetcher),
  remote: memoize(makeRemoteFetcher)
};

export const fetchSourcesFromServer = (cachedPositions: CachedPositions) =>
  axios
    .get("http://localhost:3000/status", { responseType: "json" })
    .then(({ data }) =>
      map(
        data,
        (_, file) =>
          ({
            description: file.replace(/_/g, " "),
            value: file,
            id: file,
            origin: "remote",
            chunkId: cachedPositions[file]
          } as PersistedTextSource)
      )
    );

export const createTextSource = (
  id: string,
  text: string,
  position: number
): PersistedTextSource => ({
  id,
  value: text,
  description: id,
  chunkId: position,
  origin: "local"
});

export const getNextChunk = (source: PersistedTextSource, chunkId: number) =>
  sourceFetchers[source.origin](source.value).getChunk(chunkId);

export const getSourcePreview = (
  source: PersistedTextSource,
  chunkId: number
) => sourceFetchers[source.origin](source.value).getPreview(chunkId);
