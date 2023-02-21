import { AssetIndexReference } from "./../../src/Asset";
import { expect, version } from "chai";

import {
  fetchVersionManifestV2,
  GameVersionManifest,
  VersionManifestUtils,
} from "../../src/Manifest";
import {
  GameVersionResponse,
  GameVersionResponseUtils,
  getVersion,
  RequestLibraryOptions,
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

  it("should return asset index contents", async () => {
    const assetIndexContentsResponse = await new GameVersionResponseUtils(
      version
    ).getAssetIndexContents();
    expect(assetIndexContentsResponse).to.have.ownProperty("objects");
    expect(assetIndexContentsResponse.objects).to.not.be.undefined;
  });

  it("should return all library if options is not defined ", async () => {
    const assetIndexContentsResponse = await new GameVersionResponseUtils(
      version
    );

    // console.log(assetIndexContentsResponse.getLibraries());
    const libraries = assetIndexContentsResponse.getLibraries();
    expect(libraries).to.be.an("array");
    expect(libraries.length).to.be.greaterThan(0);
  });

  it("should return allowed libraries based on the provided options", async () => {
    const options: RequestLibraryOptions = {
      platform: "win32",
    };

    const assetIndexContentsResponse = await new GameVersionResponseUtils(
      version
    );

    const libraries = assetIndexContentsResponse.getLibraries(options);
    expect(libraries).to.be.an("array");
    expect(libraries.length).to.be.greaterThan(0);

    libraries.some((library) => {
      library?.name?.includes("windows");
    });
  });

  it("should return mainClass", async () => {
    const assetIndexContentsResponse = await new GameVersionResponseUtils(
      version
    );

    const mainClass = assetIndexContentsResponse.getMainClass();
    expect(mainClass).to.be.a("string");

    expect(mainClass).includes("net.minecraft.client.main");
  });
});
