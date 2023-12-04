import type { H3Event } from 'h3';
import type { UserSession } from '#auth-utils';
export declare function getUserSession(event: H3Event): Promise<UserSession>;
/**
 * Set a user session
 * @param event
 * @param data User session data, please only store public information since it can be decoded with API calls
 */
export declare function setUserSession(event: H3Event, data: UserSession): Promise<UserSession>;
export declare function clearUserSession(event: H3Event): Promise<boolean>;
export declare function requireUserSession(event: H3Event): Promise<UserSession>;
