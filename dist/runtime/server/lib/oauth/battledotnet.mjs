import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { ofetch } from "ofetch";
import { withQuery, parsePath } from "ufo";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
import { randomUUID } from "crypto";
export function battledotnetEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.battledotnet, {
      authorizationURL: "https://oauth.battle.net/authorize",
      tokenURL: "https://oauth.battle.net/token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    const { code } = query;
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Battle.net login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_BATTLEDOTNET_CLIENT_ID or NUXT_OAUTH_BATTLEDOTNET_CLIENT_SECRET env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    if (!code) {
      config.scope = config.scope || ["openid"];
      config.region = config.region || "EU";
      if (config.region === "CN") {
        config.authorizationURL = "https://oauth.battlenet.com.cn/authorize";
        config.tokenURL = "https://oauth.battlenet.com.cn/token";
      }
      const redirectUrl2 = getRequestURL(event).href;
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectUrl2,
          scope: config.scope.join(" "),
          state: randomUUID(),
          // Todo: handle PKCE flow
          response_type: "code",
          ...config.authorizationParams
        })
      );
    }
    const redirectUrl = getRequestURL(event).href;
    config.scope = config.scope || [];
    if (!config.scope.includes("openid")) {
      config.scope.push("openid");
    }
    const authCode = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
    const tokens = await $fetch(
      config.tokenURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${authCode}`
        },
        params: {
          code,
          grant_type: "authorization_code",
          scope: config.scope.join(" "),
          redirect_uri: parsePath(redirectUrl).pathname
        }
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Battle.net login failed: ${tokens.error || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const accessToken = tokens.access_token;
    const user = await ofetch("https://oauth.battle.net/userinfo", {
      headers: {
        "User-Agent": `Battledotnet-OAuth-${config.clientId}`,
        Authorization: `Bearer ${accessToken}`
      }
    });
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Battle.net user",
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
