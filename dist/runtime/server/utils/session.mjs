import { useSession, createError } from "h3";
import { defu } from "defu";
import { createHooks } from "hookable";
import { useRuntimeConfig } from "#imports";
export const sessionHooks = createHooks();
export async function getUserSession(event) {
  return (await _useSession(event)).data;
}
export async function setUserSession(event, data) {
  const session = await _useSession(event);
  await session.update(defu(data, session.data));
  return session.data;
}
export async function clearUserSession(event) {
  const session = await _useSession(event);
  await sessionHooks.callHookParallel("clear", session.data, event);
  await session.clear();
  return true;
}
export async function requireUserSession(event) {
  const userSession = await getUserSession(event);
  if (!userSession.user) {
    throw createError({
      statusCode: 401,
      message: "Unauthorized"
    });
  }
  return userSession;
}
let sessionConfig;
function _useSession(event) {
  if (!sessionConfig) {
    sessionConfig = defu({ password: process.env.NUXT_SESSION_PASSWORD }, useRuntimeConfig(event).session);
  }
  return useSession(event, sessionConfig);
}
