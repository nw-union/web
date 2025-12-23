import { okAsync } from "neverthrow";
import type { TimePort } from "../../domain/vo";

export const newTime = (): TimePort => ({
  getNow: () => okAsync(new Date()),
});
