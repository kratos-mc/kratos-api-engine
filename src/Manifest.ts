import fse from "fs-extra";
import needle from "needle";
import { MinecraftSemver } from "./Semver";

export type GameVersionType = "release" | "snapshot" | "alpha" | "old_alpha";

/**
 * The Minecraft game version manifest which depends on `version_manifest_v2.json`.
 *
 */
export interface GameVersionManifest {
  /**
   * This section contains the newest game version for both release and snapshot.
   */
  latest: {
    /**
     * The latest release version of Minecraft, as know as the primary game version.
     */
    release: MinecraftSemver;
    /**
     * The latest snapshot release of Minecraft.
     */
    snapshot: MinecraftSemver;
  };
}

/**
 * Fetch the game version manifest from `https://piston-meta.mojang.com/mc/game/version_manifest_v2.json`.
 *
 *
 * @returns the game version manifest which received from game api
 */
export async function fetchVersionManifestV2(): Promise<GameVersionManifest> {
  const response = await needle(
    "get",
    "https://piston-meta.mojang.com/mc/game/version_manifest_v2.json"
  );
  return response.body;
}
