import { eventHandler } from "h3";
import { requireUserSession } from "../utils/session.mjs";
export default eventHandler(async (event) => {
  return await requireUserSession(event);
});
