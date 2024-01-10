import type { OAuthConfig } from '#auth-utils';
export interface OAuthKeycloakConfig {
    /**
     * Keycloak OAuth Client ID
     * @default process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_ID
     */
    clientId?: string;
    /**
     * Keycloak OAuth Client Secret
     * @default process.env.NUXT_OAUTH_KEYCLOAK_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Keycloak OAuth Server URL
     * @example http://192.168.1.10:8080/auth
     * @default process.env.NUXT_OAUTH_KEYCLOAK_SERVER_URL
     */
    serverUrl?: string;
    /**
     * Keycloak OAuth Realm
     * @default process.env.NUXT_OAUTH_KEYCLOAK_REALM
     */
    realm?: string;
    /**
     * Keycloak OAuth Scope
     * @default []
     * @see https://www.keycloak.org/docs/latest/authorization_services/
     * @example ['openid']
     */
    scope?: string[];
}
export declare function keycloakEventHandler({ config, onSuccess, onError, }: OAuthConfig<OAuthKeycloakConfig>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<any>>;
