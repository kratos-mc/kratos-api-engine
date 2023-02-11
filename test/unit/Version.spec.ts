import { AssetIndexReference } from "./../../src/Asset";
import { expect, version } from "chai";
import { Version } from "../../src/Index";
import {
  fetchVersionManifestV2,
  GameVersionManifest,
  VersionManifestUtils,
} from "../../src/Manifest";
import {
  GameVersionResponse,
  GameVersionResponseUtils,
  getVersion,
} from "../../src/Version";
import fse from "fs-extra";

let manifest: GameVersionManifest;
before(async () => {
  manifest = await fetchVersionManifestV2();

  return;
});

describe("[unit] getVersion - ", () => {
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

describe("[unit] GameVersionResponseUtils -", () => {
  let version: GameVersionResponse;
  before(async () => {
    const utils = new VersionManifestUtils(manifest);

    const latestReleaseGameVersion = utils.getVersionFromId("1.19.3");
    if (latestReleaseGameVersion === undefined) {
      throw new Error("Unable to fetch undefined latest release game version");
    }

    version = await getVersion(latestReleaseGameVersion);
  });

  it("should throw error with undefined response constructor", () => {
    expect(() => {
      new GameVersionResponseUtils(undefined as unknown as any);
    }).to.throw();
  });

  it("should return java major version", () => {
    // compare the major version of 1.19.3 <-> 17

    expect(new GameVersionResponseUtils(version).getJavaVersionMajor()).to.eq(
      17
    );
  });

  it("should return asset index", () => {
    const assetIndex: AssetIndexReference = new GameVersionResponseUtils(
      version
    ).getAssetIndex();

    expect(Object.keys(assetIndex)).to.have.members([
      "id",
      "sha1",
      "url",
      "totalSize",
      "size",
    ]);

    expect(assetIndex.id).to.be.a("string");
    expect(assetIndex.sha1).to.be.a("string");

    expect(assetIndex.size).to.be.a("number");
    expect(assetIndex.totalSize).to.be.a("number");
    expect(assetIndex.url).to.be.a("string");
  });
});
