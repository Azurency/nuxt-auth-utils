import { setCookie, getCookie, getQuery, createError } from "h3";
import { subtle, getRandomValues } from "uncrypto";
import { useRuntimeConfig } from "#imports";
const CHUNK_SIZE = 32768;
export function encodeBase64Url(input) {
  if (input instanceof ArrayBuffer) {
    input = new Uint8Array(input);
  }
  const arr = [];
  for (let i = 0; i < input.byteLength; i += CHUNK_SIZE) {
    arr.push(String.fromCharCode.apply(null, input.subarray(i, i + CHUNK_SIZE)));
  }
  return btoa(arr.join("")).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function randomBytes() {
  return encodeBase64Url(getRandomValues(new Uint8Array(32)));
}
export function generateCodeVerifier() {
  return randomBytes();
}
export function generateState() {
  return randomBytes();
}
export async function pkceCodeChallenge(verifier) {
  return encodeBase64Url(await subtle.digest({ name: "SHA-256" }, new TextEncoder().encode(verifier)));
}
export const checks = {
  /**
   * Create checks
   * @param event, H3Event
   * @param checks, OAuthChecks[] a list of checks to create
   * @returns Record<string, string> a map of check parameters to add to the authorization URL
   */
  async create(event, checks2) {
    const res = {};
    const runtimeConfig = useRuntimeConfig();
    if (checks2?.includes("pkce")) {
      const pkceVerifier = generateCodeVerifier();
      const pkceChallenge = await pkceCodeChallenge(pkceVerifier);
      res["code_challenge"] = pkceChallenge;
      res["code_challenge_method"] = "S256";
      setCookie(event, "nuxt-auth-util-verifier", pkceVerifier, runtimeConfig.nuxtAuthUtils.security.cookie);
    }
    if (checks2?.includes("state")) {
      res["state"] = generateState();
      setCookie(event, "nuxt-auth-util-state", res["state"], runtimeConfig.nuxtAuthUtils.security.cookie);
    }
    return res;
  },
  /**
   * Use checks, verifying and returning the results
   * @param event, H3Event
   * @param checks, OAuthChecks[] a list of checks to use
   * @returns CheckUseResult a map that can contain `code_verifier` if `pkce` was used to be used in the token exchange
   */
  async use(event, checks2) {
    const res = {};
    const { state } = getQuery(event);
    if (checks2?.includes("pkce")) {
      const pkceVerifier = getCookie(event, "nuxt-auth-util-verifier");
      setCookie(event, "nuxt-auth-util-verifier", "", { maxAge: -1 });
      res["code_verifier"] = pkceVerifier;
    }
    if (checks2?.includes("state")) {
      const stateInCookie = getCookie(event, "nuxt-auth-util-state");
      setCookie(event, "nuxt-auth-util-state", "", { maxAge: -1 });
      if (checks2?.includes("state")) {
        if (!state || !stateInCookie) {
          const error = createError({
            statusCode: 401,
            message: "Login failed: state is missing"
          });
          throw error;
        }
        if (state !== stateInCookie) {
          const error = createError({
            statusCode: 401,
            message: "Login failed: state does not match"
          });
          throw error;
        }
      }
    }
    return res;
  }
};
