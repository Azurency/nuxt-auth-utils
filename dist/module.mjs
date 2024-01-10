import { defineNuxtModule, createResolver, addImportsDir, addPlugin, addServerHandler } from '@nuxt/kit';
import { sha256 } from 'ohash';
import { defu } from 'defu';

const module = defineNuxtModule({
  meta: {
    name: "auth-utils",
    configKey: "auth"
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    if (!process.env.NUXT_SESSION_PASSWORD && !nuxt.options._prepare) {
      const randomPassword = sha256(`${Date.now()}${Math.random()}`).slice(0, 32);
      process.env.NUXT_SESSION_PASSWORD = randomPassword;
      console.warn("No session password set, using a random password, please set NUXT_SESSION_PASSWORD in your .env file with at least 32 chars");
      console.log(`NUXT_SESSION_PASSWORD=${randomPassword}`);
    }
    nuxt.options.alias["#auth-utils"] = resolver.resolve("./runtime/types/index");
    addImportsDir(resolver.resolve("./runtime/composables"));
    addPlugin(resolver.resolve("./runtime/plugins/session.server"));
    if (nuxt.options.nitro.imports !== false) {
      nuxt.options.nitro.imports = defu(nuxt.options.nitro.imports, {
        presets: [
          {
            from: resolver.resolve("./runtime/server/utils/oauth"),
            imports: ["oauth"]
          },
          {
            from: resolver.resolve("./runtime/server/utils/session"),
            imports: [
              "sessionHooks",
              "getUserSession",
              "setUserSession",
              "clearUserSession",
              "requireUserSession"
            ]
          }
        ]
      });
    }
    addServerHandler({
      handler: resolver.resolve("./runtime/server/api/session.delete"),
      route: "/api/_auth/session",
      method: "delete"
    });
    addServerHandler({
      handler: resolver.resolve("./runtime/server/api/session.get"),
      route: "/api/_auth/session",
      method: "get"
    });
    const runtimeConfig = nuxt.options.runtimeConfig;
    runtimeConfig.session = defu(runtimeConfig.session, {
      name: "nuxt-session",
      password: "",
      cookie: {
        sameSite: "lax"
      }
    });
    runtimeConfig.nuxtAuthUtils = defu(runtimeConfig.nuxtAuthUtils, {});
    runtimeConfig.nuxtAuthUtils.security = defu(runtimeConfig.nuxtAuthUtils.security, {
      cookie: {
        secure: true,
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 15
      }
    });
    runtimeConfig.oauth = defu(runtimeConfig.oauth, {});
    runtimeConfig.oauth.github = defu(runtimeConfig.oauth.github, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.spotify = defu(runtimeConfig.oauth.spotify, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.google = defu(runtimeConfig.oauth.google, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.twitch = defu(runtimeConfig.oauth.twitch, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.auth0 = defu(runtimeConfig.oauth.auth0, {
      clientId: "",
      clientSecret: "",
      domain: "",
      audience: ""
    });
    runtimeConfig.oauth.microsoft = defu(runtimeConfig.oauth.microsoft, {
      clientId: "",
      clientSecret: "",
      tenant: "",
      scope: [],
      authorizationURL: "",
      tokenURL: "",
      userURL: ""
    });
    runtimeConfig.oauth.discord = defu(runtimeConfig.oauth.discord, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.battledotnet = defu(runtimeConfig.oauth.battledotnet, {
      clientId: "",
      clientSecret: ""
    });
    runtimeConfig.oauth.keycloak = defu(runtimeConfig.oauth.keycloak, {
      clientId: "",
      clientSecret: "",
      serverUrl: "",
      realm: ""
    });
    runtimeConfig.oauth.linkedin = defu(runtimeConfig.oauth.linkedin, {
      clientId: "",
      clientSecret: ""
    });
  }
});

export { module as default };
