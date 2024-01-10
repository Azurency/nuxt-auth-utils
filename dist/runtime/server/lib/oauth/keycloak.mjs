import {
  eventHandler,
  createError,
  getQuery,
  getRequestURL,
  sendRedirect
} from "h3";
import { ofetch } from "ofetch";
import { withQuery, parsePath } from "ufo";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function keycloakEventHandler({
  config,
  onSuccess,
  onError
}) {
  return eventHandler(async (event) => {
    config = defu(
      config,
      // @ts-ignore
      useRuntimeConfig(event).oauth?.keycloak
    );
    const query = getQuery(event);
    const { code } = query;
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `Keycloak login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret || !config.serverUrl || !config.realm) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_KEYCLOAK_CLIENT_ID or NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET or NUXT_OAUTH_KEYCLOAK_SERVER_URL or NUXT_OAUTH_KEYCLOAK_REALM env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const realmURL = `${config.serverUrl}/realms/${config.realm}`;
    const authorizationURL = `${realmURL}/protocol/openid-connect/auth`;
    const tokenURL = `${realmURL}/protocol/openid-connect/token`;
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      config.scope = config.scope || ["openid"];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectUrl,
          scope: config.scope.join(" "),
          response_type: "code"
        })
      );
    }
    config.scope = config.scope || [];
    if (!config.scope.includes("openid")) {
      config.scope.push("openid");
    }
    const tokens = await ofetch(tokenURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        grant_type: "authorization_code",
        redirect_uri: parsePath(redirectUrl).pathname,
        code
      }).toString()
    }).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Keycloak login failed: ${tokens.error?.data?.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const accessToken = tokens.access_token;
    const user = await ofetch(
      `${realmURL}/protocol/openid-connect/userinfo`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json"
        }
      }
    );
    if (!user) {
      const error = createError({
        statusCode: 500,
        message: "Could not get Keycloak user",
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
