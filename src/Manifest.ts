import needle from "needle";
import { MinecraftVersionId } from "./Semver";

export type GameManifestVersionType =
  | "release"
  | "snapshot"
  | "alpha"
  | "old_alpha";

export interface GameManifestVersion {
  id: MinecraftVersionId;
  type: GameManifestVersionType;
  url: string;
  time: Date;
  releaseTime: Date;
  sha1: string;
  complianceLevel: number;
}
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
    release: MinecraftVersionId;
    /**
     * The latest snapshot release of Minecraft.
     */
    snapshot: MinecraftVersionId;
  };
  versions: GameManifestVersion[];
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
