export const atprotoProviders = ["bluesky"];
export const atprotoProviderDefaultClientMetadata = {
  clientMetadataFilename: "",
  clientName: "",
  clientUri: "",
  logoUri: "",
  policyUri: "",
  tosUri: "",
  scope: ["atproto"],
  grantTypes: ["authorization_code"],
  responseTypes: ["code"],
  applicationType: "web",
  redirectUris: [],
  dpopBoundAccessTokens: true,
  tokenEndpointAuthMethod: "none"
};
export function getClientMetadataFilename(provider, config) {
  return config?.clientMetadataFilename || provider + "/client-metadata.json";
}
