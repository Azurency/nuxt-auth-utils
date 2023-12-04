import type { OAuthConfig } from '#auth-utils';
export interface OAuthSpotifyConfig {
    /**
     * Spotify OAuth Client ID
     * @default process.env.NUXT_OAUTH_SPOTIFY_CLIENT_ID
     */
    clientId?: string;
    /**
     * Spotify OAuth Client Secret
     * @default process.env.NUXT_OAUTH_SPOTIFY_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Spotify OAuth Scope
     * @default []
     * @see https://developer.spotify.com/documentation/web-api/concepts/scopes
     * @example ['user-read-email']
     */
    scope?: string[];
    /**
     * Require email from user, adds the ['user-read-email'] scope if not present
     * @default false
     */
    emailRequired?: boolean;
    /**
     * Spotify OAuth Authorization URL
     * @default 'https://accounts.spotify.com/authorize'
     */
    authorizationURL?: string;
    /**
     * Spotify OAuth Token URL
     * @default 'https://accounts.spotify.com/api/token'
     */
    tokenURL?: string;
}
export declare function spotifyEventHandler({ config, onSuccess, onError }: OAuthConfig<OAuthSpotifyConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
