import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { ofetch } from "ofetch";
import { withQuery } from "ufo";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function githubEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.github, {
      authorizationURL: "https://github.com/login/oauth/authorize",
      tokenURL: "https://github.com/login/oauth/access_token",
      authorizationParams: {}
    });
    const query = getQuery(event);
    if (query.error) {
      const error = createError({
        statusCode: 401,
        message: `GitHub login failed: ${query.error || "Unknown error"}`,
        data: query
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    if (!config.clientId || !config.clientSecret) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_GITHUB_CLIENT_ID or NUXT_OAUTH_GITHUB_CLIENT_SECRET env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    if (!query.code) {
      config.scope = config.scope || [];
      if (config.emailRequired && !config.scope.includes("user:email")) {
        config.scope.push("user:email");
      }
      const redirectUrl = getRequestURL(event).href;
      return sendRedirect(
        event,
        withQuery(config.authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectUrl,
          scope: config.scope.join(" "),
          ...config.authorizationParams
        })
      );
    }
    const tokens = await $fetch(
      config.tokenURL,
      {
        method: "POST",
        body: {
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code: query.code
        }
      }
    );
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `GitHub login failed: ${tokens.error || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const accessToken = tokens.access_token;
    const user = await ofetch("https://api.github.com/user", {
      headers: {
        "User-Agent": `Github-OAuth-${config.clientId}`,
        Authorization: `token ${accessToken}`
      }
    });
    if (!user.email && config.emailRequired) {
      const emails = await ofetch("https://api.github.com/user/emails", {
        headers: {
          "User-Agent": `Github-OAuth-${config.clientId}`,
          Authorization: `token ${accessToken}`
        }
      });
      const primaryEmail = emails.find((email) => email.primary);
      if (!primaryEmail) {
        throw new Error("GitHub login failed: no user email found");
      }
      user.email = primaryEmail.email;
    }
    return onSuccess(event, {
      user,
      tokens
    });
  });
}
