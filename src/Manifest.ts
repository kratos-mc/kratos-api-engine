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

/**
 * The utility class for solve version manifest problem much easier and faster.
 */
export class VersionManifestUtils {
  private manifest: GameVersionManifest;
  private searchMap: Map<string, GameManifestVersion>;

  constructor(manifest: GameVersionManifest) {
    if (manifest === undefined) {
      throw new Error("The manifest parameter cannot be undefined.");
    }
    this.manifest = manifest;
    this.searchMap = this.getVersionsMap();
  }

  /**
   * Extract the manifest latest release version id.
   *
   * @since 1.0.0
   * @returns the latest release version id
   */
  public getLatestRelease() {
    return this.manifest.latest.release;
  }

  /**
   * Extract the manifest latest snapshot version.
   *
   * @since 1.0.0
   * @returns the latest snapshot version id
   */
  public getLatestSnapshot() {
    return this.manifest.latest.snapshot;
  }

  /**
   * Export the versions from manifest as a Map.
   * @since 1.0.0
   * @returns a map that contains all manifest versions
   */
  public getVersionsMap() {
    const map: Map<string, GameManifestVersion> = new Map();
    for (const item of this.manifest.versions) {
      map.set(item.id, item);
    }
    return map;
  }

  /**
   * Get the game version property from game version id.
   * @since 1.0.0
   * @param id an id of the game version
   * @returns a GameManifestVersion if the version is exist. Otherwise, undefined will return
   */
  public getVersionFromId(id: string) {
    return this.searchMap.get(id);
  }

  /**
   * Iterate over the version list and search for matching items. If the pattern is a string,
   * using `includes` to compare. If the `pattern` is RegExp, using `match`.
   *
   *  @since 1.0.0
   * @param patterns a string or regexp pattern that match with version id.
   * @returns a list of items that match to pattern
   */
  public searchVersion(pattern: RegExp | string) {
    if (typeof pattern !== "string" && !(pattern instanceof RegExp)) {
      throw new Error(
        "Invalid type of pattern. It must be a string or RegExp."
      );
    }
    const search: GameManifestVersion[] = [];
    for (const version of this.getVersionsArray()) {
      if (
        (typeof pattern === "string" && version.id.includes(pattern)) ||
        (pattern instanceof RegExp && pattern.test(version.id))
      ) {
        search.push(version);
      }
    }

    return search;
  }

  /**
   * Get all version items as an array by looking the manifest.versions.
   *
   * @since 1.0.0
   * @returns an array contains all versions
   */
  public getVersionsArray() {
    return this.manifest.versions;
  }
}
