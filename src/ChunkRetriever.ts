import axios from "axios";
import { memoize, map, values } from "lodash";
import { TextSource } from "./App/TextSourceChooser";
import { PersistedTextSource } from "./store";

type MyPr = Promise<{ text: string; newId: number }>;

export interface Sources {
  [id: string]: PersistedTextSource;
}

export interface CachedPositions {
  [id: string]: number;
}

function makeLocalFetcher(text: string) {
  const textLines =
    typeof text === "string" // backward compatability
      ? text.split("\n").filter(line => line !== "")
      : text;

  return (chunkId: number): MyPr =>
    new Promise(
      (resolve, failure) =>
        chunkId <= textLines.length && chunkId >= 1
          ? resolve({ text: textLines[chunkId - 1], newId: chunkId })
          : failure("Out of bounds")
    );
}

function makeRemoteFetcher(file: string) {
  return (chunkId: number): MyPr =>
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
      );
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

export default class ChunkRetriever {
  sources: Sources = {};

  addTextSource(id: string, text: string, position: number = 1) {
    if (this.sources[id]) return false;

    this.sources[id] = {
      origin: "local",
      description: id,
      id,
      value: text,
      chunkId: position
    };

    return true;
  }

  removeTextSource(id: string) {
    delete this.sources[id];
  }

  getNextChunk = (textSourceId: string, chunkId: number) =>
    getNextChunk(this.sources[textSourceId], chunkId);
}

export const getOptions = (sources: Sources) => values(sources);

export const getNextChunk = (source: PersistedTextSource, chunkId: number) =>
  sourceFetchers[source.origin](source.value)(chunkId).then(chunk => {
    source.chunkId = chunk.newId;
    return chunk;
  });
