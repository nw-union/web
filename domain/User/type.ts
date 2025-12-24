import type { Email, Url } from "../vo";

export type User = {
  type: "User";

  id: string;
  name: string;
  email: Email;
  imgUrl: Url | null;
  createdAt: Date;
  updatedAt: Date;
};
