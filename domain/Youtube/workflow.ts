import { okAsync, ResultAsync } from "neverthrow";
import type { YoutubeWorkFlows } from "../../type";
import type { TimePort } from "../port";
import { newYoutubeId } from "../vo";
import { createYoutube } from "./logic";
import type { YoutubeRepositoryPort } from "./port";

export const newYoutubeWorkFlows = (
  r: YoutubeRepositoryPort,
  t: TimePort,
): YoutubeWorkFlows => ({
  /**
   * Youtube 作成
   */
  create: ({ id, title, channelName, duration, isPublic }) =>
    // Step.1 検証 & 現在日時取得
    //   string -> [YoutubeId, string, string, string, boolean, Date]
    ResultAsync.combine([
      // SubStep.1 YoutubeId 検証
      okAsync(id).andThen(newYoutubeId),
      // SubStep.2 その他フィールドはそのまま通す
      okAsync(title),
      okAsync(channelName),
      okAsync(duration),
      okAsync(isPublic),
      // SubStep.3 現在日時取得
      t.getNow(),
    ])
      // Step.2 Youtube 作成
      //   [YoutubeId, string, string, string, boolean, Date] -> Youtube
      .map(createYoutube)
      // Step.3 Youtube 保存
      .andThrough(r.upsert)
      // Step.4 イベント生成
      .map((youtube) => ({ id: youtube.id })),
});
