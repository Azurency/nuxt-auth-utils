import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery, parsePath } from "ufo";
import { ofetch } from "ofetch";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function spotifyEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.spotify, {
      authorizationURL: "https://accounts.spotify.com/authorize",
      tokenURL: "https://accounts.spotify.com/api/token"
    });
    const { code } = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_SPOTIFY_CLIENT_ID or NUXT_OAUTH_SPOTIFY_CLIENT_SECRET env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("user-read-email")) {
        config.scope.push("user-read-email");
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
    const authCode = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64");
    const tokens = await ofetch(
      config.tokenURL,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${authCode}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        params: {
          grant_type: "authorization_code",
          redirect_uri: parsePath(redirectUrl).pathname,
          code
        }
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Spotify login failed: ${tokens.error?.data?.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const accessToken = tokens.access_token;
    const user = await ofetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
