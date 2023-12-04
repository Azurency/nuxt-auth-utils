import type { H3Event, H3Error } from 'h3';
export interface OAuthMicrosoftConfig {
    /**
     * Microsoft OAuth Client ID
     * @default process.env.NUXT_OAUTH_MICROSOFT_CLIENT_ID
     */
    clientId?: string;
    /**
     * Microsoft  OAuth Client Secret
     * @default process.env.NUXT_OAUTH_MICROSOFT_CLIENT_SECRET
     */
    clientSecret?: string;
    /**
     * Microsoft OAuth Tenant ID
     * @default process.env.NUXT_OAUTH_MICROSOFT_TENANT
     */
    tenant?: string;
    /**
     * Microsoft  OAuth Scope
     * @default ['User.Read']
     * @see https://learn.microsoft.com/en-us/entra/identity-platform/scopes-oidc
     */
    scope?: string[];
    /**
     * Microsoft OAuth Authorization URL
     * @default https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize
     * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
     */
    authorizationURL?: string;
    /**
     * Microsoft OAuth Token URL
     * @default https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token
     * @see https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
     */
    tokenURL?: string;
    /**
     * Microsoft OAuth User URL
     * @default https://graph.microsoft.com/v1.0/me
     * @see https://docs.microsoft.com/en-us/graph/api/user-get?view=graph-rest-1.0&tabs=http
     */
    userURL?: string;
}
interface OAuthConfig {
    config?: OAuthMicrosoftConfig;
    onSuccess: (event: H3Event, result: {
        user: any;
        tokens: any;
    }) => Promise<void> | void;
    onError?: (event: H3Event, error: H3Error) => Promise<void> | void;
}
export declare function microsoftEventHandler({ config, onSuccess, onError }: OAuthConfig): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<void>>;
export {};
