import type { User as UserDto } from "../../type";
import type { Email, Url } from "../vo";
import type { User } from "./type";

// ----------------------------------------------------------------------------
// Validator (DTO -> Domain Type)
// ----------------------------------------------------------------------------
// なし

// ----------------------------------------------------------------------------
// Domain Logic (Domain Type -> Domain Type)
// ----------------------------------------------------------------------------
/**
 * User を新規作成
 */
export const createUser = ([id, email, now]: [string, Email, Date]): User => ({
  type: "User",
  id: id,
  name: email.split("@")[0], // デフォルトは email の @ より前の部分
  email: email,
  imgUrl: null,
  createdAt: now,
  updatedAt: now,
});

/**
 * User を更新
 */
export const updateUser = ([user, name, imgUrl, now]: [
  User,
  string,
  Url | null,
  Date,
]): User => ({
  ...user,
  name,
  imgUrl,
  updatedAt: now,
});

// ----------------------------------------------------------------------------
// Converter (Domain Type -> DTO)
// ----------------------------------------------------------------------------
export const convToUserDto = (u: User): UserDto => ({
  id: u.id,
  name: u.name,
  email: u.email,
  imgUrl: u.imgUrl ?? "",
});
