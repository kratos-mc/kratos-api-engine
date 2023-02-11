import { expect, version } from "chai";
import { Version } from "../../src/Index";
import {
  fetchVersionManifestV2,
  GameVersionManifest,
  VersionManifestUtils,
} from "../../src/Manifest";
import { getVersion } from "../../src/Version";
import fse from "fs-extra";

describe("[unit] getVersion - ", () => {
  let manifest: GameVersionManifest;

  before(async () => {
    manifest = await fetchVersionManifestV2();

    return;
  });
  it(`should return a version`, async () => {
    const versions = new VersionManifestUtils(manifest).getVersionsArray();
    expect(Array.isArray(versions)).to.be.true;

    const version = await getVersion(versions[0]);

    expect(version).not.to.be.undefined;

    expect(Object.keys(version)).to.have.members([
      "arguments",
      "assetIndex",
      "assets",
      "complianceLevel",
      "downloads",
      "id",
      "javaVersion",
      "libraries",
      "logging",
      "mainClass",
      "minimumLauncherVersion",
      "releaseTime",
      "time",
      "type",
    ]);
  });
});
