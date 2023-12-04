import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery, parsePath } from "ufo";
import { ofetch } from "ofetch";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
import { checks } from "../../utils/security.mjs";
export function auth0EventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.auth0);
    const { code } = getQuery(event);
    if (!config.clientId || !config.clientSecret || !config.domain) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_AUTH0_CLIENT_ID or NUXT_OAUTH_AUTH0_CLIENT_SECRET or NUXT_OAUTH_AUTH0_DOMAIN env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const authorizationURL = `https://${config.domain}/authorize`;
    const tokenURL = `https://${config.domain}/oauth/token`;
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      const authParam = await checks.create(event, config.checks);
      config.scope = config.scope || ["openid", "offline_access"];
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
      }
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectUrl,
          scope: config.scope.join(" "),
          audience: config.audience || "",
          max_age: config.maxAge || 0,
          ...authParam
        })
      );
    }
    let checkResult;
    try {
      checkResult = await checks.use(event, config.checks);
    } catch (error) {
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const tokens = await ofetch(
      tokenURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: {
          grant_type: "authorization_code",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: parsePath(redirectUrl).pathname,
          code,
          ...checkResult
        }
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Auth0 login failed: ${tokens.error?.data?.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const user = await ofetch(`https://${config.domain}/userinfo`, {
      headers: {
        Authorization: `${tokenType} ${accessToken}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
