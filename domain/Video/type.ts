import type { VideoId } from "../vo";

export type Video = {
  type: "Video";

  id: VideoId;
  title: string;
  channelName: string;
  duration: string;
  uploadedAt: string;
  isPublic: boolean;
};
