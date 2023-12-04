import type { OAuthConfig } from '#auth-utils';
export interface OAuthGoogleConfig {
    /**
     * Google OAuth Client ID
     * @default process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID
     */
    clientId?: string;
    /**
     * Google OAuth Client Secret
     * @default process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Google OAuth Scope
     * @default []
     * @see https://developers.google.com/identity/protocols/oauth2/scopes#google-sign-in
     * @example ['email', 'openid', 'profile']
     */
    scope?: string[];
    /**
     * Google OAuth Authorization URL
     * @default 'https://accounts.google.com/o/oauth2/v2/auth'
     */
    authorizationURL?: string;
    /**
     * Google OAuth Token URL
     * @default 'https://oauth2.googleapis.com/token'
     */
    tokenURL?: string;
    /**
     * Redirect URL post authenticating via google
     * @default '/auth/google'
     */
    redirectUrl: '/auth/google';
}
export declare function googleEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthGoogleConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
