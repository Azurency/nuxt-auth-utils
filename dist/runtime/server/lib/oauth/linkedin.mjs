import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery, parseURL, stringifyParsedURL } from "ufo";
import { ofetch } from "ofetch";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function linkedinEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.linkedin, {
      authorizationURL: "https://www.linkedin.com/oauth/v2/authorization",
      tokenURL: "https://www.linkedin.com/oauth/v2/accessToken"
    });
    const { code } = getQuery(event);
    if (!config.clientId || !config.clientSecret) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_LINKEDIN_CLIENT_ID or NUXT_OAUTH_LINKEDIN_CLIENT_SECRET env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      config.scope = config.scope || [];
      if (!config.scope.length) {
        config.scope.push("profile", "openid", "email");
      }
      if (config.emailRequired && !config.scope.includes("email")) {
        config.scope.push("email");
      }
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          response_type: "code",
          client_id: config.clientId,
          redirect_uri: redirectUrl,
          scope: config.scope.join(" ")
        })
      );
    }
    const parsedRedirectUrl = parseURL(redirectUrl);
    parsedRedirectUrl.search = "";
    const tokens = await ofetch(
      config.tokenURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          client_id: config.clientId,
          client_secret: config.clientSecret,
          redirect_uri: stringifyParsedURL(parsedRedirectUrl)
        }).toString()
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `LinkedIn login failed: ${tokens.error?.data?.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const accessToken = tokens.access_token;
    const user = await ofetch("https://api.linkedin.com/v2/userinfo", {
      headers: {
        "user-agent": "Nuxt Auth Utils",
        Authorization: `Bearer ${accessToken}`
      }
    });
    return onSuccess(event, {
      tokens,
      user
    });
  });
}
