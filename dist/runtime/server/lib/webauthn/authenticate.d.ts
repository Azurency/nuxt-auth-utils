import type { WebAuthnAuthenticateEventHandlerOptions, WebAuthnCredential } from '#auth-utils';
export declare function defineWebAuthnAuthenticateEventHandler<T extends WebAuthnCredential>({ storeChallenge, getChallenge, getCredential, allowCredentials, getOptions, onSuccess, onError, }: WebAuthnAuthenticateEventHandlerOptions<T>): import("h3").EventHandler<import("h3").EventHandlerRequest, Promise<void | import("@simplewebauthn/server").VerifiedAuthenticationResponse | {
    requestOptions: import("@simplewebauthn/types").PublicKeyCredentialRequestOptionsJSON;
    attemptId: string;
}>>;
