import { eventHandler, createError, getQuery, getRequestURL, sendRedirect } from "h3";
import { withQuery, parsePath } from "ufo";
import { ofetch } from "ofetch";
import { defu } from "defu";
import { useRuntimeConfig } from "#imports";
export function cognitoEventHandler({ config, onSuccess, onError }) {
  return eventHandler(async (event) => {
    config = defu(config, useRuntimeConfig(event).oauth?.cognito, {
      authorizationParams: {}
    });
    const { code } = getQuery(event);
    if (!config.clientId || !config.clientSecret || !config.userPoolId || !config.region) {
      const error = createError({
        statusCode: 500,
        message: "Missing NUXT_OAUTH_COGNITO_CLIENT_ID, NUXT_OAUTH_COGNITO_CLIENT_SECRET, NUXT_OAUTH_COGNITO_USER_POOL_ID, or NUXT_OAUTH_COGNITO_REGION env variables."
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const authorizationURL = `https://${config.userPoolId}.auth.${config.region}.amazoncognito.com/oauth2/authorize`;
    const tokenURL = `https://${config.userPoolId}.auth.${config.region}.amazoncognito.com/oauth2/token`;
    const redirectUrl = getRequestURL(event).href;
    if (!code) {
      config.scope = config.scope || ["openid", "profile"];
      return sendRedirect(
        event,
        withQuery(authorizationURL, {
          client_id: config.clientId,
          redirect_uri: redirectUrl,
          response_type: "code",
          scope: config.scope.join(" "),
          ...config.authorizationParams
        })
      );
    }
    const tokens = await ofetch(
      tokenURL,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `grant_type=authorization_code&client_id=${config.clientId}&client_secret=${config.clientSecret}&redirect_uri=${parsePath(redirectUrl).pathname}&code=${code}`
      }
    ).catch((error) => {
      return { error };
    });
    if (tokens.error) {
      const error = createError({
        statusCode: 401,
        message: `Cognito login failed: ${tokens.error_description || "Unknown error"}`,
        data: tokens
      });
      if (!onError)
        throw error;
      return onError(event, error);
    }
    const tokenType = tokens.token_type;
    const accessToken = tokens.access_token;
    const user = await ofetch(`https://${config.userPoolId}.auth.${config.region}.amazoncognito.com/oauth2/userInfo`, {
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
