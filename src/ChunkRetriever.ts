import axios from "axios";
import { isUndefined, keys, forOwn } from "lodash";
import { memoize } from "lodash";
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

export default class ChunkRetriever {
  private cachedPositions: CachedPositions;
  private sources: Sources = {};

  constructor(cachedPositions: CachedPositions = {}) {
    this.cachedPositions = cachedPositions;
  }

  fetchOptionsFromServer = () =>
    axios
      .get("http://localhost:3000/status", { responseType: "json" })
      .then(({ data }) =>
        forOwn(
          data,
          (_, file) =>
            (this.sources[file] = {
              description: file.replace(/_/g, " "),
              value: file,
              id: file,
              origin: "remote",
              chunkId: this.cachedPositions[file]
            })
        )
      );

  addTextSource(id: string, text: string) {
    if (this.sources[id]) return false;

    this.sources[id] = {
      origin: "local",
      description: id,
      id,
      value: text,
      chunkId: 1
    };

    return true;
  }

  removeTextSource(id: string) {
    delete this.sources[id];
  }

  getOptions(): TextSource<string>[] {
    return keys(this.sources).map(
      key =>
        ({
          id: key,
          description: this.sources[key].description,
          chunkId: this.cachedPositions[key],
          origin: "remote"
        } as TextSource<typeof key>)
    );
  }

  getNextChunk(textSourceId: string, chunkId: number): MyPr {
    const source = this.sources[textSourceId];
    return sourceFetchers[source.origin](source.value)(chunkId).then(chunk => {
      this.cachedPositions[source.id] = chunk.newId;
      this.sources[source.id].chunkId = chunk.newId;
      return chunk;
    });
  }
}
