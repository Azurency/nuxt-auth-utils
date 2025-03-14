import * as _nuxt_schema from '@nuxt/schema';
import { ScryptConfig } from '@adonisjs/hash/types';
import { SessionConfig } from 'h3';

interface ModuleOptions {
    /**
     * Enable WebAuthn (Passkeys)
     * @default false
     */
    webAuthn?: boolean;
    /**
     * Enable atproto OAuth (Bluesky, etc.)
     * @default false
     */
    atproto?: boolean;
    /**
     * Hash options used for password hashing
     */
    hash?: {
        /**
         * scrypt options used for password hashing
         */
        scrypt?: ScryptConfig;
    };
}
declare module 'nuxt/schema' {
    interface RuntimeConfig {
        hash: {
            scrypt: ScryptConfig;
        };
        /**
         * Session configuration
         */
        session: SessionConfig;
    }
}
declare const _default: _nuxt_schema.NuxtModule<ModuleOptions, ModuleOptions, false>;

export { type ModuleOptions, _default as default };
