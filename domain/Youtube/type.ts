import type { YoutubeId } from "../vo";

export type Youtube = {
  type: "Youtube";

  id: YoutubeId;
  title: string;
  channelName: string;
  duration: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
};
