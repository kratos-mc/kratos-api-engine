import { expect } from "chai";
import { Manifest } from "../src/Index";

describe("Manifest fetch test", () => {
  it("should response a game version manifest with full property", async () => {
    expect(await Manifest.fetchVersionManifestV2()).to.have.ownProperty(
      "latest"
    );
  });
});
