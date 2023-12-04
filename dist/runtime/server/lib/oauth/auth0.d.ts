import type { OAuthConfig } from '#auth-utils';
import { type OAuthChecks } from '../../utils/security';
export interface OAuthAuth0Config {
    /**
     * Auth0 OAuth Client ID
     * @default process.env.NUXT_OAUTH_AUTH0_CLIENT_ID
     */
    clientId?: string;
    /**
     * Auth0 OAuth Client Secret
     * @default process.env.NUXT_OAUTH_AUTH0_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Auth0 OAuth Issuer
     * @default process.env.NUXT_OAUTH_AUTH0_DOMAIN
     */
    domain?: string;
    /**
     * Auth0 OAuth Audience
     * @default ''
     */
    audience?: string;
    /**
     * Auth0 OAuth Scope
     * @default []
     * @see https://auth0.com/docs/get-started/apis/scopes/openid-connect-scopes
     * @example ['openid']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Maximum Authentication Age. If the elapsed time is greater than this value, the OP must attempt to actively re-authenticate the end-user.
     * @default 0
     * @see https://auth0.com/docs/authenticate/login/max-age-reauthentication
     */
    maxAge?: number;
    /**
     * checks
     * @default []
     * @see https://auth0.com/docs/flows/authorization-code-flow-with-proof-key-for-code-exchange-pkce
     * @see https://auth0.com/docs/protocols/oauth2/oauth-state
     */
    checks?: OAuthChecks[];
}
export declare function auth0EventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthAuth0Config>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
