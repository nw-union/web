import { okAsync } from "neverthrow";
import type { YoutubePort } from "../../domain/Youtube/port";

// ----------------------------------------------------------------------------
// Port 実装
// ----------------------------------------------------------------------------
export const newYoutubeMock = (): YoutubePort => ({
  fetchInfo: (_) =>
    okAsync({
      type: "YoutubeInfo",
      title: "Mock Video Title",
      channelName: "NWU",
      duration: "PT45M59S",
      isPublic: true,
    }),
});
