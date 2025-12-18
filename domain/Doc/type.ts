// import type { AppError } from "@nw-union/nw-utils";
// import type { ResultAsync } from "neverthrow";

export type Doc = {
  type: "Doc";

  id: string;
  title: string;
  description: string;
  status: "public" | "private";
  body: string;
  createdAt: Date;
  updatedAt: Date;
};
