import type { NoteId, Url } from "../vo";

export type Note = {
  type: "Note";

  id: NoteId;
  title: string;
  noteUserName: string;
  url: Url;
  thumbnailUrl: Url | null;
  createdAt: Date;
  updatedAt: Date;
};
