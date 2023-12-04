import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery, parsePath } from "ufo";
import { ofetch } from "ofetch";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function twitchEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.twitch, {
      authorizationURL: "https://id.twitch.tv/oauth2/authorize",
      tokenURL: "https://id.twitch.tv/oauth2/token"
    });
    const { code } = getQuery(event);
    if (!config.clientId) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_TWITCH_CLIENT_ID env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("user:read:email")) {
        config.scope.push("user:read:email");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectUrl,
          scope: config.scope.join("%20")
        })
      );
    }
    const tokens = await ofetch(
      config.tokenURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
          grant_type: "authorization_code",
          redirect_uri: parsePath(redirectUrl).pathname,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code
        }
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Twitch login failed: ${tokens.error?.data?.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const accessToken = tokens.access_token;
    const users = await ofetch("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": config.clientId,
        Authorization: `Bearer ${accessToken}`
      }
    });
    const user = users.data?.[0];
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Twitch user",
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
