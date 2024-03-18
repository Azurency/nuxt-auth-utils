import { defineNuxtModule, createResolver, addImportsDir, addPlugin, addServerHandler } from '@nuxt/kit';
import { join } from 'pathe';
import { defu } from 'defu';
import { randomUUID } from 'uncrypto';
import { readFile, writeFile } from 'node:fs/promises';

const module = defineNuxtModule({
  meta: {
    name: "auth-utils",
    configKey: "auth"
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
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
              "replaceUserSession",
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
      password: process.env.NUXT_SESSION_PASSWORD || "",
      cookie: {
        sameSite: "lax"
      }
    });
    if (nuxt.options.dev && !runtimeConfig.session.password) {
      runtimeConfig.session.password = randomUUID().replace(/-/g, "");
      const envPath = join(nuxt.options.rootDir, ".env");
      const envContent = await readFile(envPath, "utf-8").catch(() => "");
      if (!envContent.includes("NUXT_SESSION_PASSWORD")) {
        await writeFile(envPath, `${envContent ? envContent + "\n" : envContent}NUXT_SESSION_PASSWORD=${runtimeConfig.session.password}`, "utf-8");
      }
    }
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
    runtimeConfig.oauth.cognito = defu(runtimeConfig.oauth.cognito, {
      clientId: "",
      clientSecret: "",
      region: "",
      userPoolId: ""
    });
  }
});

export { module as default };
