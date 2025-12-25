import type { DocId } from "../vo";

export type DocKioku = {
  type: "DocKioku";

  id: DocId;
  title: string;
  thumbnailUrl: string;
  createdAt: Date;
};

export type NoteKioku = {
  type: "NoteKioku";

  id: string;
  title: string;
  noteUserName: string;
  url: string;
  thumbnailUrl: string;
  createdAt: Date;
};

export type YoutubeKioku = {
  type: "YoutubeKioku";

  id: string;
  title: string;
  channelName: string;
  isPublic: boolean;
  duration: string;
  createdAt: Date;
};

export type Kioku = DocKioku | NoteKioku | YoutubeKioku;
