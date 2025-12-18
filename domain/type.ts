import { z } from "zod";
import { newType } from "@nw-union/nw-utils/lib/zod";
// import { uuidv4 } from "@nw-union/nw-utils/lib/uuid";

/**
 * DocId ドキュメントID型
 *
 * UUID `z.uuidv4()`
 */
const docId = z.uuidv4().brand("DocId"); // UUID
export type DocId = z.infer<typeof docId>;
export const newDocId = newType(docId, "DocId");
// export const createDocId = () => newDocId(uuidv4())._unsafeUnwrap();
