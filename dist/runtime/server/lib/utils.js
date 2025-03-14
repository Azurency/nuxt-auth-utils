import { getRequestURL } from "h3";
import { FetchError } from "ofetch";
import { snakeCase, upperFirst } from "scule";
import * as jose from "jose";
import { createError } from "#imports";
export function getOAuthRedirectURL(event) {
  const requestURL = getRequestURL(event);
  return `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`;
}
export async function requestAccessToken(url, options) {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    ...options.headers
  };
  const body = headers["Content-Type"] === "application/x-www-form-urlencoded" ? new URLSearchParams(
    options.body || options.params || {}
  ).toString() : options.body;
  return $fetch(url, {
    method: "POST",
    headers,
    body
  }).catch((error) => {
    if (error instanceof FetchError && error.status === 401) {
      return error.data;
    }
    throw error;
  });
}
export function handleAccessTokenErrorResponse(event, oauthProvider, oauthError, onError) {
  const message = `${upperFirst(oauthProvider)} login failed: ${oauthError.error_description || oauthError.error || "Unknown error"}`;
  const error = createError({
    statusCode: 401,
    message,
    data: oauthError
  });
  if (!onError) throw error;
  return onError(event, error);
}
export function handleMissingConfiguration(event, provider, missingKeys, onError) {
  const environmentVariables = missingKeys.map((key) => `NUXT_OAUTH_${provider.toUpperCase()}_${snakeCase(key).toUpperCase()}`);
  const error = createError({
    statusCode: 500,
    message: `Missing ${environmentVariables.join(" or ")} env ${missingKeys.length > 1 ? "variables" : "variable"}.`
  });
  if (!onError) throw error;
  return onError(event, error);
}
export async function signJwt(payload, options) {
  const now = Math.floor(Date.now() / 1e3);
  const privateKey = await jose.importPKCS8(
    options.privateKey.replace(/\\n/g, "\n"),
    options.algorithm || "ES256"
  );
  return new jose.SignJWT(payload).setProtectedHeader({ alg: options.algorithm || "ES256", kid: options.keyId }).setIssuedAt(now).setExpirationTime(options.expiresIn || "5m").sign(privateKey);
}
export async function verifyJwt(token, options) {
  const JWKS = jose.createRemoteJWKSet(new URL(options.publicJwkUrl));
  const { payload } = await jose.jwtVerify(token, JWKS, {
    audience: options.audience,
    issuer: options.issuer
  });
  return payload;
}
