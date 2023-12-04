import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery, parsePath } from "ufo";
import { ofetch } from "ofetch";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function microsoftEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.microsoft);
    const { code } = getQuery(event);
    if (!config.clientId || !config.clientSecret || !config.tenant) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_MICROSOFT_CLIENT_ID or NUXT_OAUTH_MICROSOFT_CLIENT_SECRET or NUXT_OAUTH_MICROSOFT_TENANT env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const authorizationURL = config.authorizationURL || `https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/authorize`;
    const tokenURL = config.tokenURL || `https://login.microsoftonline.com/${config.tenant}/oauth2/v2.0/token`;
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      const scope = config.scope && config.scope.length > 0 ? config.scope : ["User.Read"];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          response_type: "code",
          redirect_uri: redirectUrl,
          scope: scope.join("%20")
        })
      );
    }
    const data = new URLSearchParams();
    data.append("grant_type", "authorization_code");
    data.append("client_id", config.clientId);
    data.append("client_secret", config.clientSecret);
    data.append("redirect_uri", parsePath(redirectUrl).pathname);
    data.append("code", String(code));
    const tokens = await ofetch(
      tokenURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: data
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Microsoft login failed: ${tokens.error?.data?.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const userURL = config.userURL || "https://graph.microsoft.com/v1.0/me";
    const user = await ofetch(userURL, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`
      }
    }).catch((error) => {
      return { error };
    });
    if (user.error) {
      const error = createError({
        statusCode: 401,
        message: `Microsoft login failed: ${user.error || "Unknown error"}`,
        data: user
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
