import { expect } from "chai";
import {
  fetchVersionManifestV2,
  GameVersionManifest,
  VersionManifestUtils,
} from "./../../src/Manifest";
import { getAssetIndexFromReference } from "../../src/Asset";
import { GameVersionResponse, getVersion } from "../../src/Version";

let manifest: GameVersionManifest;
let version: GameVersionResponse;

before(async () => {
  manifest = await fetchVersionManifestV2();
  const _version = new VersionManifestUtils(manifest).getVersionFromId(
    "1.19.3"
  );
  if (!_version) {
    throw new Error("Version not found " + _version);
  }
  version = await getVersion(_version);
  return;
});

describe("[unit] getAssetIndexFromReference -", () => {
  it("should return asset index content", async () => {
    // await getAssetIndexFromReference(version.assetIndex)
    const assetIndexContent = await getAssetIndexFromReference(
      version.assetIndex
    );
    expect(assetIndexContent).to.have.property("objects");
    expect(assetIndexContent.objects).to.be.an("object");

    // asset all items must have a hash (string) and size (number)
    const allKeys = Object.keys(assetIndexContent.objects);
    expect(
      allKeys
        .map((keyString) => assetIndexContent.objects[keyString])
        .map(
          (instanceOfObject) =>
            instanceOfObject.hash !== undefined &&
            instanceOfObject.size !== undefined &&
            typeof instanceOfObject.hash === "string" &&
            typeof instanceOfObject.size === "number"
        )
        .every(() => true)
    ).to.be.true;
  });
});
