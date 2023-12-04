import type { OAuthConfig } from '#auth-utils';
export interface OAuthTwitchConfig {
    /**
     * Twitch Client ID
     * @default process.env.NUXT_OAUTH_TWITCH_CLIENT_ID
     */
    clientId?: string;
    /**
    * Twitch OAuth Client Secret
    * @default process.env.NUXT_OAUTH_TWITCH_CLIENT_SECRET
    */
    clientSecret?: string;
    /**
     * Twitch OAuth Scope
     * @default []
     * @see https://dev.twitch.tv/docs/authentication/scopes
     * @example ['user:read:email']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['user:read:email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Twitch OAuth Authorization URL
     * @default 'https://id.twitch.tv/oauth2/authorize'
     */
    authorizationURL?: string;
    /**
     * Twitch OAuth Token URL
     * @default 'https://id.twitch.tv/oauth2/token'
     */
    tokenURL?: string;
}
export declare function twitchEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthTwitchConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
