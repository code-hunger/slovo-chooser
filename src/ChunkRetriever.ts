import axios from "axios";
import { isUndefined, keys, forOwn } from "lodash";

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

export default class ChunkRetriever {
  private cachedPositions: CachedPositions;
  private sources: Sources = {};

  constructor(cachedPositions: CachedPositions = {}) {
    this.cachedPositions = cachedPositions;
  }

  getOptionsFromServer = () =>
    axios.get("http://localhost:3000/status", { responseType: "json" }).then(({ data }) => {
      forOwn(data, (_, file) => {
        this.sources[file] = {
          description: file.replace(/_/g, " "),
          fetch: this.chunkFromLocalServer.bind(this, file)
        };
      });
      return this.getOptions();
    });

  addTextSource(id: string, text: string) {
    if (this.sources[id]) return false;
    const lines = text.split("\n").filter(line => line !== "");
    this.sources[id] = {
      fetch: (chunkId: number) => {
        return new Promise((resolve, failure) => {
          if (chunkId > lines.length) failure("Out of bounds");
          else resolve({ text: lines[chunkId - 1], newId: chunkId });
        });
      },
      description: id
    };
    return true;
  }

  removeTextSource(id: string) {
    delete this.sources[id];
  }

  chunkFromLocalServer(file: string, chunkId: number): MyPr {
    return axios
      .get("http://localhost:3000/text", {
        params: { chunkId, file },
        responseType: "json"
      })
      .then(
        ({ data }) => {
          this.cachedPositions[file] = data.chunkId;
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

  getOptions() {
    return keys(this.sources).map(key => ({
      id: key,
      description: this.sources[key].description,
      chunkId: this.cachedPositions[key]
    }));
  }

  positionBySource = (textSourceId: string, newValue?: number) => {
    if (isUndefined(newValue)) return this.cachedPositions[textSourceId];
    return (this.cachedPositions[textSourceId] = newValue);
  };

  getNextChunk(textSourceId: string, chunkId?: number): MyPr {
    if (isUndefined(chunkId)) {
      if (textSourceId in this.cachedPositions)
        chunkId = this.cachedPositions[textSourceId] + 1;
      else chunkId = 1;
    }

    return this.sources[textSourceId].fetch(chunkId).then(response => {
      this.positionBySource(textSourceId, chunkId);
      return response;
    });
  }
}
