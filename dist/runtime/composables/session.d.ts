export declare const useUserSession: () => {
    loggedIn: any;
    user: any;
    session: any;
    fetch: typeof fetch;
    clear: typeof clear;
};
declare function fetch(): Promise<void>;
declare function clear(): Promise<void>;
export {};
