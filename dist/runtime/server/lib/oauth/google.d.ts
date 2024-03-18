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
     * Extra authorization parameters to provide to the authorization URL
     * @see https://developers.google.com/identity/protocols/oauth2/web-server#httprest_3
     * @example { access_type: 'offline' }
     */
    authorizationParams?: Record<string, string>;
}
export declare function googleEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthGoogleConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
