import { ValidationError } from "@nw-union/nw-utils";
import { err, ok, type Result } from "neverthrow";
import type { DocStatus } from "../../../type";

interface ValidatedDocUpdate {
  body: string;
  title: string;
  status: DocStatus;
}

export const validateDocUpdate = (
  body: string | null,
  title: string | null,
  status: string | null,
): Result<ValidatedDocUpdate, ValidationError> => {
  if (!body) {
    return err(new ValidationError("ドキュメント本文が空です"));
  }

  if (!title) {
    return err(new ValidationError("タイトルが空です"));
  }

  const validStatuses: DocStatus[] = ["public", "private"];
  if (!status || !validStatuses.includes(status as DocStatus)) {
    return err(new ValidationError("無効なステータスです"));
  }

  return ok({
    body,
    title,
    status: status as DocStatus,
  });
};
