import axios from "axios";

export default class ChunkRetriever {
  private cachedChunkId;

  constructor(cachedChunkId) {
    this.cachedChunkId = cachedChunkId;
  }

  getNextChunk(chunkId = this.cachedChunkId + 1) {
    this.cachedChunkId = chunkId;
    return axios.get("/text", {
      params: { chunkId },
      responseType: "json"
    });
  }
}
