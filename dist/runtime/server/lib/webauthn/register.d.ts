import type { H3Event } from 'h3';
import type { WebAuthnUser, WebAuthnRegisterEventHandlerOptions } from '#auth-utils';
import type { ValidateUserFunction } from '~/src/runtime/types/webauthn';
export declare function defineWebAuthnRegisterEventHandler<T extends WebAuthnUser>({ storeChallenge, getChallenge, getOptions, validateUser, excludeCredentials, onSuccess, onError, }: WebAuthnRegisterEventHandlerOptions<T>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<void | import("@simplewebauthn/server").VerifiedRegistrationResponse | {
    creationOptions: import("@simplewebauthn/types").PublicKeyCredentialCreationOptionsJSON;
    attemptId: string;
}>>;
export declare function validateUserData<T>(userBody: WebAuthnUser, event: H3Event, fn: ValidateUserFunction<T>): Promise<T>;
