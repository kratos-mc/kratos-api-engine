import { VersionManifestUtils } from "./../../src/Manifest";
import { assert, expect } from "chai";
import { Manifest } from "../../src/Index";
import {
  fetchVersionManifestV2,
  GameVersionManifest,
} from "../../src/Manifest";

/**
 * Assert if the object that is a game version or not.
 *
 * @param gameVersion a game version object to test
 */
const assertGameVersion = (gameVersion: any) => {
  expect(Object.keys(gameVersion)).to.have.members([
    "id",
    "type",
    "url",
    "time",
    "releaseTime",
    "sha1",
    "complianceLevel",
  ]);

  expect(gameVersion.id).to.be.a("string");
  expect(gameVersion.sha1).to.be.a("string");
  expect(gameVersion.complianceLevel).to.be.a("number");
};

describe("[unit] manifest fetch test - ", () => {
  it("should response a game version manifest with full property", async () => {
    const manifestData = await Manifest.fetchVersionManifestV2();
    // console.log(manifestData);

    expect(manifestData).to.have.ownProperty("latest");
    expect(manifestData).to.have.ownProperty("versions");

    expect(Object.keys(manifestData.latest)).to.have.members([
      "release",
      "snapshot",
    ]);

    expect(manifestData.versions).to.be.an("array");
    const firstGameVersion = manifestData.versions[0];
    assertGameVersion(firstGameVersion);
  });
});

describe("[unit] manifest utils - ", () => {
  let manifest: GameVersionManifest;

  before(async () => {
    manifest = await fetchVersionManifestV2();

    return;
  });

  it(`should throw with undefined parameter`, () => {
    expect(() => {
      new VersionManifestUtils(undefined as unknown as GameVersionManifest);
    }).to.throw("The manifest parameter cannot be undefined.");
  });

  it("should return latest release and snapshot", () => {
    const utils = new VersionManifestUtils(manifest);
    const latestVersion = utils.getLatestRelease();
    expect(latestVersion).to.eq(manifest.latest.release);

    const snapshotVersion = utils.getLatestSnapshot();
    expect(snapshotVersion).to.eq(manifest.latest.snapshot);
  });

  it("should execute get game version with specific game version", () => {
    const utils = new VersionManifestUtils(manifest);

    const someExistGameVersion = utils.getVersionFromId("1.19.3");
    expect(someExistGameVersion).to.not.be.undefined;
    assertGameVersion(someExistGameVersion);

    const someNonExistGameVersion = utils.getVersionFromId(
      "this-is-a-crazy-version"
    );
    expect(someNonExistGameVersion).to.be.undefined;
  });

  it("should search matching version or throw error", () => {
    const utils = new VersionManifestUtils(manifest);

    // throws an error on undefined or not string | RegExp type
    expect(() => {
      utils.searchVersion(12 as unknown as string);
    }).to.throw("Invalid type of pattern. It must be a string or RegExp.");

    // returns as an array
    const relativeVersion = utils.searchVersion("1.12");
    expect(Array.isArray(relativeVersion)).to.be.true;
    expect(relativeVersion.length).to.be.greaterThan(0);

    // assert any version inside the relative array
    expect(
      relativeVersion
        .map((gameVersion) => assertGameVersion(gameVersion))
        .every(() => true)
    ).to.be.true;

    // returns empty array if not found version
    const mustBeEmptyArray = utils.searchVersion("this-is-so-amazing-version");
    expect(Array.isArray(mustBeEmptyArray)).to.be.a.string;
    expect(mustBeEmptyArray.length).to.eq(0);

    // use regex as a search
    const regexSearch = utils.searchVersion(/1.+/);
    expect(Array.isArray(regexSearch)).to.be.true;
    expect(regexSearch.length).to.be.greaterThan(10);
    expect(
      relativeVersion
        .map((gameVersion) => assertGameVersion(gameVersion))
        .every(() => true)
    ).to.be.true;
  });
});
