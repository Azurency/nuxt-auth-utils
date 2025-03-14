import { type H3Event } from 'h3';
import type { OAuthChecks } from '#auth-utils';
export declare function encodeBase64Url(input: Uint8Array | ArrayBuffer): string;
/**
 * Generate a random `code_verifier` for use in the PKCE flow
 * @see https://tools.ietf.org/html/rfc7636#section-4.1
 */
export declare function generateCodeVerifier(): string;
/**
 * Generate a random `state` used to prevent CSRF attacks
 * @see https://www.rfc-editor.org/rfc/rfc6749.html#section-4.1.1
 */
export declare function generateState(): string;
/**
 * Generate a `code_challenge` from a `code_verifier` for use in the PKCE flow
 * @param verifier `code_verifier` string
 * @returns `code_challenge` string
 * @see https://tools.ietf.org/html/rfc7636#section-4.1
 */
export declare function pkceCodeChallenge(verifier: string): Promise<string>;
interface CheckUseResult {
    code_verifier?: string;
}
/**
 * Checks for PKCE and state
 */
export declare const checks: {
    /**
     * Create checks
     * @param event H3Event
     * @param checks OAuthChecks[] a list of checks to create
     * @returns Record<string, string> a map of check parameters to add to the authorization URL
     */
    create(event: H3Event, checks?: OAuthChecks[]): Promise<Record<string, string>>;
    /**
     * Use checks, verifying and returning the results
     * @param event H3Event
     * @param checks OAuthChecks[] a list of checks to use
     * @returns CheckUseResult a map that can contain `code_verifier` if `pkce` was used to be used in the token exchange
     */
    use(event: H3Event, checks?: OAuthChecks[]): Promise<CheckUseResult>;
};
export {};
