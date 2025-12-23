import type { String1To100, Url } from "../vo";

export type Doc = {
  type: "Doc";

  id: string;
  title: String1To100;
  description: String1To100 | null;
  status: "public" | "private";
  body: string;
  thumbnailUrl: Url | null;
  createdAt: Date;
  updatedAt: Date;
};
