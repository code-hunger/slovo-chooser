import axios from "axios";
import * as _ from "lodash";

type MyPr = Promise<{ text: string; newId: number }>;
interface Source {
  id: string;
  fetch: (chunkId: number) => MyPr;
  description: string;
}

interface CachedPositions {
  [id: string]: number;
}

export default class ChunkRetriever {
  private cachedPositions: CachedPositions;
  private sourses: Source[] = [];

  constructor(cachedPositions: CachedPositions = {}) {
    this.cachedPositions = cachedPositions;
  }

  getOptionsFromServer = () =>
    axios.get("/status", { responseType: "json" }).then(({ data }) => {
      _.forOwn(data, (_, file) => {
        this.sourses.push({
          id: file,
          description: file,
          fetch: this.chunkFromLocalServer.bind(this, file)
        });
      });
      return this.getOptions();
    });

  chunkFromLocalServer(file: string, chunkId: number): MyPr {
    return axios
      .get("/text", {
        params: { chunkId, file },
        responseType: "json"
      })
      .then(
        ({ data }) => {
          this.cachedPositions[file] = data.newChunkId;
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
    return this.sourses.map((source, index) => ({
      id: index,
      description: source.description
    }));
  }

  positionBySource = (textSourceId: number, newValue?: number) => {
    if (_.isUndefined(newValue))
      return this.cachedPositions[this.sourses[textSourceId].id];
    return (this.cachedPositions[this.sourses[textSourceId].id] = newValue);
  };

  getNextChunk(
    textSourceId: number,
    chunkId = this.positionBySource(textSourceId) + 1
  ): MyPr {
    this.positionBySource(textSourceId, chunkId);
    return this.sourses[textSourceId].fetch(chunkId);
  }
}
