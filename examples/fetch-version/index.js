const {
  fetchVersionManifestV2,
  VersionManifestUtils,
} = require("kratos-api-engine/dist/Manifest");

(async () => {
  const manifest = await fetchVersionManifestV2();

  const utils = new VersionManifestUtils(manifest);

  console.log(
    `The latest minecraft version now is ${utils.getLatestRelease()}`
  );
})().catch(console.error);
