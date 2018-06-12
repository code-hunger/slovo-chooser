import axios from "axios";
import * as _ from "lodash";

type MyPr = Promise<{ text: string; newId: number }>;
interface Source {
  fetch: (chunkId: number) => MyPr;
  description: string;
}
export default class ChunkRetriever {
  private cachedChunkId: number;
  private sourses: Source[] = [];

  constructor(cachedChunkId: number) {
    this.cachedChunkId = cachedChunkId;
  }

  getOptionsFromServer = () =>
    axios.get("/status", { responseType: "json" }).then(({ data }) => {
      _.forOwn(data, (_, file) => {
        this.sourses.push({
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
          this.cachedChunkId = data.newChunkId;
          return { text: data.text, newId: data.chunkId };
        },
        error => {
          if(error.response) {
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

  getNextChunk(textSourceId: number, chunkId = this.cachedChunkId + 1): MyPr {
    this.cachedChunkId = chunkId;
    return this.sourses[textSourceId].fetch(chunkId);
  }
}
