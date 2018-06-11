import axios from "axios";
import * as _ from "lodash";

type MyPr = Promise<{ data: { text: string; chunkId: number } }>;
interface Source {
  fetch: (chunkId: number) => MyPr;
  description: string;
}
export default class ChunkRetriever {
  private cachedChunkId: number;
  private sourses: Source[] = [];

  constructor(cachedChunkId) {
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
    return axios.get("/text", {
      params: { chunkId, file },
      responseType: "json"
    });
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
