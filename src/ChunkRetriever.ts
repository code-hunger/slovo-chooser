import axios from "axios";

export default class ChunkRetriever {
  private cachedChunkId;
  private sourses = [
    chunkId => {
      this.cachedChunkId = chunkId;
      return axios.get("/text", {
        params: { chunkId },
        responseType: "json"
      });
    }
  ];

  constructor(cachedChunkId) {
    this.cachedChunkId = cachedChunkId;
  }

  getOptions() {
    axios
      .get("/status", { responseType: "json" })
      .then(data => console.log(data));
    return [{ id: 0, description: "Local server" }];
  }

  getNextChunk(textSourceId: number, chunkId = this.cachedChunkId + 1) {
    return this.sourses[textSourceId].call(this, chunkId);
  }
}
