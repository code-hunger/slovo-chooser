import axios from "axios";

type MyPr = Promise<{ data: { text: string; chunkId: number } }>;
type Source = (chunkId: number) => MyPr;

export default class ChunkRetriever {
  private cachedChunkId;
  private sourses: Source[] = [this.chunkFromLocalServer.bind(this)];

  constructor(cachedChunkId) {
    this.cachedChunkId = cachedChunkId;
  }

  chunkFromLocalServer(chunkId: number): MyPr {
    return axios.get("/text", {
      params: { chunkId },
      responseType: "json"
    });
  }

  getOptions() {
    axios.get("/status", { responseType: "json" }).then(({ data }) => {});
    return [{ id: 0, description: "Local server" }];
  }

  getNextChunk(textSourceId: number, chunkId = this.cachedChunkId + 1): MyPr {
    this.cachedChunkId = chunkId;
    return this.sourses[textSourceId](chunkId);
  }
}
