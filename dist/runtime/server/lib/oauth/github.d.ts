import type { OAuthConfig } from '#auth-utils';
export interface OAuthGitHubConfig {
    /**
     * GitHub OAuth Client ID
     * @default process.env.NUXT_OAUTH_GITHUB_CLIENT_ID
     */
    clientId?: string;
    /**
     * GitHub OAuth Client Secret
     * @default process.env.NUXT_OAUTH_GITHUB_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * GitHub OAuth Scope
     * @default []
     * @see https://docs.github.com/en/developers/apps/building-oauth-apps/scopes-for-oauth-apps
     * @example ['user:email']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['user:email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * GitHub OAuth Authorization URL
     * @default 'https://github.com/login/oauth/authorize'
     */
    authorizationURL?: string;
    /**
     * GitHub OAuth Token URL
     * @default 'https://github.com/login/oauth/access_token'
     */
    tokenURL?: string;
    /**
     * Extra authorization parameters to provide to the authorization URL
     * @see https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps#1-request-a-users-github-identity
     * @example { allow_signup: 'true' }
     */
    authorizationParams?: Record<string, string>;
}
export declare function githubEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthGitHubConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
