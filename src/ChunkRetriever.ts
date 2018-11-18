import axios from "axios";
import { isUndefined, keys, forOwn } from "lodash";
import { TextSource } from "./App/TextSourceChooser";

type MyPr = Promise<{ text: string; newId: number }>;

export interface Sources {
  [id: string]: {
    fetch: (chunkId: number) => MyPr;
    description: string;
  };
}

export interface CachedPositions {
  [id: string]: number;
}

function makeLocalFetcher(textLines: string[]) {
  return (chunkId: number): MyPr =>
    new Promise(
      (resolve, failure) =>
        chunkId <= textLines.length && chunkId >= 1
          ? resolve({ text: textLines[chunkId - 1], newId: chunkId })
          : failure("Out of bounds")
    );
}

function makeRemoteFetcher(file: string, updateCachedPosition) {
  return (chunkId: number): MyPr =>
    axios
      .get("http://localhost:3000/text", {
        params: { chunkId, file },
        responseType: "json"
      })
      .then(
        ({ data }) => {
          if (data.error) throw data.error;
          updateCachedPosition(data.chunkId);
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
  local: makeLocalFetcher,
  remote: makeRemoteFetcher
};

export default class ChunkRetriever {
  private cachedPositions: CachedPositions;
  private sources: Sources = {};

  constructor(cachedPositions: CachedPositions = {}) {
    this.cachedPositions = cachedPositions;
  }

  getOptionsFromServer = () =>
    axios
      .get("http://localhost:3000/status", { responseType: "json" })
      .then(({ data }) => {
        forOwn(data, (_, file) => {
          this.sources[file] = {
            description: file.replace(/_/g, " "),
            fetch: sourceFetchers.remote(
              file,
              chunkId => (this.cachedPositions[file] = chunkId)
            )
          };
        });
        return this.getOptions();
      });

  addTextSource(id: string, chunks: string[]) {
    if (this.sources[id]) return false;

    this.sources[id] = {
      fetch: sourceFetchers.local(chunks),
      description: id
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

  positionBySource = (textSourceId: string, newValue?: number) => {
    if (isUndefined(newValue)) return this.cachedPositions[textSourceId];
    return (this.cachedPositions[textSourceId] = newValue);
  };

  getNextChunk(textSourceId: string, chunkId?: number): MyPr {
    if (isUndefined(chunkId)) {
      chunkId = 1;
    }

    return this.sources[textSourceId].fetch(chunkId).then(response => {
      this.positionBySource(textSourceId, chunkId);
      return response;
    });
  }
}
