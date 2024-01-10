import type { H3Event } from 'h3';
import type { UserSession } from '#auth-utils';
export interface SessionHooks {
    /**
     * Called when fetching the session from the API
     * - Add extra properties to the session
     * - Throw an error if the session could not be verified (with a database for example)
     */
    'fetch': (session: UserSession, event: H3Event) => void | Promise<void>;
    /**
     * Called before clearing the session
     */
    'clear': (session: UserSession, event: H3Event) => void | Promise<void>;
}
export declare const sessionHooks: import("hookable").Hookable<SessionHooks, import("hookable").HookKeys<SessionHooks>>;
export declare function getUserSession(event: H3Event): Promise<UserSession>;
/**
 * Set a user session
 * @param event
 * @param data User session data, please only store public information since it can be decoded with API calls
 */
export declare function setUserSession(event: H3Event, data: UserSession): Promise<UserSession>;
export declare function clearUserSession(event: H3Event): Promise<boolean>;
export declare function requireUserSession(event: H3Event): Promise<UserSession>;
