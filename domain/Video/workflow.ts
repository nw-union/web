import { okAsync } from "neverthrow";
import type { VideoWorkFlows } from "../../type";
import type { VideoRepositoryPort } from "./port";

export const newVideoWorkFlows = (r: VideoRepositoryPort): VideoWorkFlows => ({
  /*
   * Video を探す
   */
  search: (q) =>
    okAsync(q)
      .andThen(r.search)
      .map((videos) => ({ videos })),
});
