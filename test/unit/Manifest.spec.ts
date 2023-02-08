import { VersionManifestUtils } from "./../../src/Manifest";
import { expect } from "chai";
import { Manifest } from "../../src/Index";
import {
  fetchVersionManifestV2,
  GameVersionManifest,
} from "../../src/Manifest";

describe("[unit] manifest fetch test", () => {
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
    expect(Object.keys(firstGameVersion)).to.have.members([
      "id",
      "type",
      "url",
      "time",
      "releaseTime",
      "sha1",
      "complianceLevel",
    ]);

    expect(firstGameVersion.id).to.be.a("string");
    expect(firstGameVersion.sha1).to.be.a("string");
    expect(firstGameVersion.complianceLevel).to.be.a("number");
    // expect(firstGameVersion.time)
  });
});

describe("[unit] manifest utils", () => {
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

  it("should return latest release", () => {
    expect(new VersionManifestUtils(manifest).getLatestRelease()).to.eq(
      manifest.latest.release
    );
  });
});
